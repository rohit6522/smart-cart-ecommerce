package com.smartcart.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SetBudgetRequest {

    @NotNull(message = "Budget amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Budget cannot be negative")
    private BigDecimal totalBudget;
}