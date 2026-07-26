package com.smartcart.backend.dto;

import com.smartcart.backend.entity.Coupon;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {
    private Long id;
    private String code;
    private String description;
    private Coupon.DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private Boolean firstOrderOnly;
    private Boolean active;
    private LocalDateTime expiresAt;
}