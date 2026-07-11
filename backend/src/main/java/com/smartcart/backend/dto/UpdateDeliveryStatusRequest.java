package com.smartcart.backend.dto;

import com.smartcart.backend.entity.DeliveryAssignment;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateDeliveryStatusRequest {

    @NotNull(message = "Status is required")
    private DeliveryAssignment.DeliveryStatus status;
}   