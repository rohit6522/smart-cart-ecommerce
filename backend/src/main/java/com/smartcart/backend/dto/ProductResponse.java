package com.smartcart.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private String category;
    private String imageUrl;
    private LocalDateTime createdAt;

    private BigDecimal discountPercentage;
    private BigDecimal discountedPrice; // computed field, sent pre-calculated to frontend
    private Double averageRating;
    private Long totalReviews;
    private List<VariantResponse> variants; // in ProductResponse
}