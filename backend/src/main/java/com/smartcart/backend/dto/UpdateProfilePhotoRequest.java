package com.smartcart.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfilePhotoRequest {
    @NotBlank(message = "Photo data is required")
    private String profilePhoto; // base64 data URL, e.g. "data:image/jpeg;base64,..."
}