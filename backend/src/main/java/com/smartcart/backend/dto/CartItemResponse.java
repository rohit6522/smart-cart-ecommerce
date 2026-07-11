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
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String imageUrl;
    private BigDecimal priceAtAdd;
    private Integer quantity;
    private BigDecimal subtotal; // priceAtAdd * quantity
}