package com.smartcart.backend.dto;

import com.smartcart.backend.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String phone;
    private String address;

    // USER, ADMIN, or DELIVERY_BOY - defaults to USER if not provided
    private User.Role role;
}