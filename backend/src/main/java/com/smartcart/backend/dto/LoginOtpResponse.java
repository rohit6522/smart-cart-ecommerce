package com.smartcart.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginOtpResponse {
    private String message;
    private String email;
    private boolean requiresOtp;

    // Only populated when requiresOtp = false (direct login for non-admin roles)
    private String token;
    private Long userId;
    private String name;
    private String role;
}