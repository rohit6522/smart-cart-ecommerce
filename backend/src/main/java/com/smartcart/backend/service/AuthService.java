package com.smartcart.backend.service;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.entity.*;
import com.smartcart.backend.exception.ApiException;
import com.smartcart.backend.repository.BudgetRepository;
import com.smartcart.backend.repository.CartRepository;
import com.smartcart.backend.repository.CouponRepository;
import com.smartcart.backend.repository.LoginOtpRepository;
import com.smartcart.backend.repository.UserRepository;
import com.smartcart.backend.security.JwtUtil;
import com.smartcart.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final BudgetRepository budgetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CouponRepository couponRepository;
    private final SecurityUtil securityUtil;
    private final LoginOtpRepository loginOtpRepository;
    private final ResendEmailService emailService;

    // false = users are verified automatically at signup and logged in directly.
    // Set EMAIL_VERIFICATION_ENABLED=true only after your sending domain is verified in Resend.
    @Value("${app.email-verification.enabled:false}")
    private boolean emailVerificationEnabled;

    // ================= REGISTER =================

    public LoginOtpResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }

        User.Role role = request.getRole() != null ? request.getRole() : User.Role.USER;
        if (role == User.Role.ADMIN) {
            throw new ApiException("Admin accounts cannot be self-registered", HttpStatus.FORBIDDEN);
        }

        // Validate referral code if one was provided
        String referredByCode = null;
        if (request.getReferralCode() != null && !request.getReferralCode().isBlank()) {
            String enteredCode = request.getReferralCode().trim().toUpperCase();
            boolean exists = userRepository.findAll().stream()
                    .anyMatch(u -> enteredCode.equals(u.getReferralCode()));
            if (!exists) {
                throw new ApiException("Invalid referral code", HttpStatus.BAD_REQUEST);
            }
            referredByCode = enteredCode;
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(role)
                .referralCode(generateReferralCode())
                .referredByCode(referredByCode)
                .emailVerified(!emailVerificationEnabled)
                .build();

        user = userRepository.save(user);

        if (role == User.Role.USER) {
            Cart cart = Cart.builder().user(user).build();
            cartRepository.save(cart);

            Budget budget = Budget.builder()
                    .user(user)
                    .totalBudget(BigDecimal.ZERO)
                    .currentSpent(BigDecimal.ZERO)
                    .build();
            budgetRepository.save(budget);
        }

        // If they signed up with a valid referral code, grant welcome coupons to both users
        if (referredByCode != null) {
            grantReferralCoupon(user, "Welcome bonus for joining via referral");
        }

        // Verification switched off: log the user in immediately
        if (!emailVerificationEnabled) {
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            return LoginOtpResponse.builder()
                    .message("Registration successful")
                    .email(user.getEmail())
                    .requiresOtp(false)
                    .token(token)
                    .userId(user.getId())
                    .name(user.getName())
                    .role(user.getRole().name())
                    .build();
        }

        // Verification switched on: send an OTP and wait for the user to confirm
        String otp = generateOtp();
        LoginOtp verificationOtp = LoginOtp.builder()
                .email(user.getEmail())
                .otpCode(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        loginOtpRepository.save(verificationOtp);
        emailService.sendOtpEmail(user, otp);

        return LoginOtpResponse.builder()
                .message("Registration successful. Please verify your email.")
                .email(user.getEmail())
                .requiresOtp(true)
                .build();
    }

    // Only used when email verification is enabled
    public AuthResponse verifyEmailAndLogin(VerifyEmailRequest request) {
        LoginOtp loginOtp = loginOtpRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(request.getEmail())
                .orElseThrow(() -> new ApiException("No verification request found. Please register again.", HttpStatus.BAD_REQUEST));

        if (loginOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("Verification code has expired. Please register again.", HttpStatus.BAD_REQUEST);
        }

        if (!loginOtp.getOtpCode().equals(request.getOtp().trim())) {
            throw new ApiException("Invalid verification code", HttpStatus.BAD_REQUEST);
        }

        loginOtp.setUsed(true);
        loginOtpRepository.save(loginOtp);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        user.setEmailVerified(true);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profilePhoto(user.getProfilePhoto())
                .build();
    }

    // ================= REFERRALS =================

    private String generateReferralCode() {
        String candidate;
        boolean exists;
        do {
            candidate = "SC-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            final String codeToCheck = candidate;
            exists = userRepository.findAll().stream().anyMatch(u -> codeToCheck.equals(u.getReferralCode()));
        } while (exists);
        return candidate;
    }

    private void grantReferralCoupon(User referredUser, String description) {
        // Reward the new user
        Coupon newUserCoupon = Coupon.builder()
                .code("WELCOME-" + referredUser.getId())
                .description(description)
                .discountType(Coupon.DiscountType.FLAT)
                .discountValue(BigDecimal.valueOf(100))
                .minOrderValue(BigDecimal.valueOf(300))
                .firstOrderOnly(false)
                .active(true)
                .assignedUser(referredUser)
                .build();
        couponRepository.save(newUserCoupon);

        // Reward the referrer too
        userRepository.findAll().stream()
                .filter(u -> referredUser.getReferredByCode().equals(u.getReferralCode()))
                .findFirst()
                .ifPresent(referrer -> {
                    Coupon referrerCoupon = Coupon.builder()
                            .code("REFBONUS-" + referrer.getId() + "-" + referredUser.getId())
                            .description("Thanks for referring " + referredUser.getName() + "!")
                            .discountType(Coupon.DiscountType.FLAT)
                            .discountValue(BigDecimal.valueOf(100))
                            .minOrderValue(BigDecimal.valueOf(300))
                            .firstOrderOnly(false)
                            .active(true)
                            .assignedUser(referrer)
                            .build();
                    couponRepository.save(referrerCoupon);
                });
    }

    public MyReferralResponse getMyReferralInfo() {
        String email = securityUtil.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        // Backfill referral code if somehow missing (e.g. older accounts)
        if (user.getReferralCode() == null) {
            user.setReferralCode(generateReferralCode());
            userRepository.save(user);
        }

        long totalReferred = userRepository.findAll().stream()
                .filter(u -> user.getReferralCode().equals(u.getReferredByCode()))
                .count();

        return MyReferralResponse.builder()
                .referralCode(user.getReferralCode())
                .totalReferred(totalReferred)
                .build();
    }

    // ================= LOGIN =================

    // Step 1: check credentials. Admin gets an OTP, everyone else is logged in directly.
    public LoginOtpResponse loginStepOne(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        // Block only explicitly unverified accounts, and only when verification is switched on
        if (emailVerificationEnabled && Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new ApiException("Please verify your email before logging in", HttpStatus.FORBIDDEN);
        }

        if (user.getRole() != User.Role.ADMIN) {
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            return LoginOtpResponse.builder()
                    .message("Login successful")
                    .email(user.getEmail())
                    .requiresOtp(false)
                    .token(token)
                    .userId(user.getId())
                    .name(user.getName())
                    .role(user.getRole().name())
                    .build();
        }

        String otp = generateOtp();

        LoginOtp loginOtp = LoginOtp.builder()
                .email(user.getEmail())
                .otpCode(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        loginOtpRepository.save(loginOtp);

        emailService.sendOtpEmail(user, otp);

        return LoginOtpResponse.builder()
                .message("OTP sent to your registered email")
                .email(user.getEmail())
                .requiresOtp(true)
                .build();
    }

    // Step 2 (admin only): verify OTP, then issue JWT
    public AuthResponse verifyOtpAndLogin(VerifyOtpRequest request) {
        LoginOtp loginOtp = loginOtpRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(request.getEmail())
                .orElseThrow(() -> new ApiException("No OTP request found. Please login again.", HttpStatus.BAD_REQUEST));

        if (loginOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("OTP has expired. Please login again.", HttpStatus.BAD_REQUEST);
        }

        if (!loginOtp.getOtpCode().equals(request.getOtp().trim())) {
            throw new ApiException("Invalid OTP", HttpStatus.BAD_REQUEST);
        }

        loginOtp.setUsed(true);
        loginOtpRepository.save(loginOtp);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profilePhoto(user.getProfilePhoto())
                .build();
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }

    // ================= PROFILE PHOTO =================

    public String updateProfilePhoto(String base64Photo) {
        String email = securityUtil.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        // Basic size guard - the base64 string should stay small after client-side compression
        if (base64Photo.length() > 3_000_000) {
            throw new ApiException("Image is too large. Please use an image under 2MB.", HttpStatus.BAD_REQUEST);
        }

        user.setProfilePhoto(base64Photo);
        userRepository.save(user);
        return base64Photo;
    }

    public String getMyProfilePhoto() {
        String email = securityUtil.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return user.getProfilePhoto();
    }

    // ================= FORGOT / RESET PASSWORD =================

    // Step 1: send OTP for password reset
    public LoginOtpResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("No account found with this email", HttpStatus.NOT_FOUND));

        String otp = generateOtp();

        LoginOtp loginOtp = LoginOtp.builder()
                .email(user.getEmail())
                .otpCode(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        loginOtpRepository.save(loginOtp);

        emailService.sendOtpEmail(user, otp);

        return LoginOtpResponse.builder()
                .message("OTP sent to your registered email")
                .email(user.getEmail())
                .requiresOtp(true)
                .build();
    }

    // Step 2: verify OTP and set the new password
    public void resetPassword(ResetPasswordRequest request) {
        LoginOtp loginOtp = loginOtpRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(request.getEmail())
                .orElseThrow(() -> new ApiException("No OTP request found. Please try again.", HttpStatus.BAD_REQUEST));

        if (loginOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("OTP has expired. Please try again.", HttpStatus.BAD_REQUEST);
        }

        if (!loginOtp.getOtpCode().equals(request.getOtp().trim())) {
            throw new ApiException("Invalid OTP", HttpStatus.BAD_REQUEST);
        }

        if (request.getNewPassword().length() < 6) {
            throw new ApiException("Password must be at least 6 characters", HttpStatus.BAD_REQUEST);
        }

        loginOtp.setUsed(true);
        loginOtpRepository.save(loginOtp);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}