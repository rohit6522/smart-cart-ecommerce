package com.smartcart.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private Long cartId;
    private List<CartItemResponse> items;
    private BigDecimal cartTotal;       // sum of all items

    // Budget tracking fields - the "smart" part
    private BigDecimal totalBudget;
    private BigDecimal currentSpent;    // equals cartTotal, kept in sync
    private BigDecimal remainingBudget; // totalBudget - currentSpent
    private boolean overBudget;         // true if currentSpent > totalBudget
    private double percentageUsed;      // for progress bar UI (0-100+)
}