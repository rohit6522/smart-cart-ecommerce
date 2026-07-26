package com.smartcart.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidationResponse {
    private String code;
    private BigDecimal discountAmount;
    private BigDecimal cartTotal;
    private BigDecimal finalTotal;
}