package com.smartcart.backend.controller;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Registration successful")
                .data(response)
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginOtpResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginOtpResponse response = authService.loginStepOne(request);
        return ResponseEntity.ok(ApiResponse.<LoginOtpResponse>builder()
                .success(true)
                .message("OTP sent")
                .data(response)
                .build());
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtpAndLogin(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Login successful")
                .data(response)
                .build());
    }

    @GetMapping("/api/user/referral")
    public ResponseEntity<ApiResponse<MyReferralResponse>> getMyReferralInfo() {
        MyReferralResponse response = authService.getMyReferralInfo();
        return ResponseEntity.ok(ApiResponse.<MyReferralResponse>builder()
                .success(true)
                .message("Referral info fetched")
                .data(response)
                .build());
    }


    @PutMapping("/api/user/profile-photo")
    public ResponseEntity<ApiResponse<String>> updateProfilePhoto(@Valid @RequestBody UpdateProfilePhotoRequest request) {
        String photo = authService.updateProfilePhoto(request.getProfilePhoto());
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Profile photo updated")
                .data(photo)
                .build());
    }

    @GetMapping("/api/user/profile-photo")
    public ResponseEntity<ApiResponse<String>> getProfilePhoto() {
        String photo = authService.getMyProfilePhoto();
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Profile photo fetched")
                .data(photo)
                .build());
    }

}