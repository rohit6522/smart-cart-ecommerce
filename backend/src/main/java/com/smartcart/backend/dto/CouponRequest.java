package com.smartcart.backend.dto;

import com.smartcart.backend.entity.Coupon;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    @NotBlank(message = "Coupon code is required")
    private String code;

    private String description;

    @NotNull(message = "Discount type is required")
    private Coupon.DiscountType discountType;

    @NotNull(message = "Discount value is required")
    private BigDecimal discountValue;

    @NotNull(message = "Minimum order value is required")
    private BigDecimal minOrderValue;

    private Boolean firstOrderOnly;
    private Boolean active;
    private LocalDateTime expiresAt;
}