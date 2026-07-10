package com.smartcart.backend.service;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.entity.Budget;
import com.smartcart.backend.entity.Cart;
import com.smartcart.backend.entity.User;
import com.smartcart.backend.exception.ApiException;
import com.smartcart.backend.repository.BudgetRepository;
import com.smartcart.backend.repository.CartRepository;
import com.smartcart.backend.repository.UserRepository;
import com.smartcart.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final BudgetRepository budgetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }

        User.Role role = request.getRole() != null ? request.getRole() : User.Role.USER;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(role)
                .build();

        user = userRepository.save(user);

        // If it's a normal shopper, auto-create their cart + default budget
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

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
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
}