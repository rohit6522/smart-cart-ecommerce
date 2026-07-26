package com.smartcart.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReturnRequest {
    @NotBlank(message = "Please provide a reason for return")
    private String reason;
}