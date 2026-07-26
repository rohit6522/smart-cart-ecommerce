package com.smartcart.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    // Populated only when paying via Razorpay; null/empty means Cash on Delivery
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    private String couponCode;
}