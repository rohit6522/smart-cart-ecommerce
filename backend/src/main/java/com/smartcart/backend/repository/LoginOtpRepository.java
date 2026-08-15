package com.smartcart.backend.repository;

import com.smartcart.backend.entity.LoginOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LoginOtpRepository extends JpaRepository<LoginOtp, Long> {
    Optional<LoginOtp> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);
}