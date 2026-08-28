package com.smartcart.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VariantRequest {
    @NotBlank(message = "Variant type is required")
    private String variantType;

    @NotBlank(message = "Variant value is required")
    private String variantValue;

    @NotNull(message = "Stock quantity is required")
    private Integer stockQuantity;
}