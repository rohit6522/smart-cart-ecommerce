package com.smartcart.backend.service;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.entity.*;
import com.smartcart.backend.exception.ApiException;
import com.smartcart.backend.repository.BudgetRepository;
import com.smartcart.backend.repository.CartRepository;
import com.smartcart.backend.repository.CouponRepository;
import com.smartcart.backend.repository.UserRepository;
import com.smartcart.backend.security.JwtUtil;
import com.smartcart.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.smartcart.backend.repository.LoginOtpRepository;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.math.BigDecimal;
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
    
    public AuthResponse register(RegisterRequest request) {

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

        // If they signed up with a valid referral code, immediately grant them a welcome coupon
        if (referredByCode != null) {
            grantReferralCoupon(user, "Welcome bonus for joining via referral");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

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

    // ---------- Step 1: Verify credentials, then send OTP ----------
    public LoginOtpResponse loginStepOne(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
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
                .build();
    }

    // ---------- Step 2: Verify OTP, then issue JWT ----------
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
                .build();
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }


}