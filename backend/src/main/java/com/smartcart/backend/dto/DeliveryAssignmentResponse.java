package com.smartcart.backend.dto;

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
public class DeliveryAssignmentResponse {
    private Long assignmentId;
    private Long orderId;
    private String status;
    private LocalDateTime assignedAt;
    private LocalDateTime deliveredAt;

    // Order details useful for delivery boy
    private BigDecimal orderTotal;
    private String deliveryAddress;
    private String customerName;
    private String customerPhone;
}