package com.smartcart.backend.controller;

import com.smartcart.backend.dto.ApiResponse;
import com.smartcart.backend.dto.RazorpayOrderResponse;
import com.smartcart.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<RazorpayOrderResponse>> createOrder() {
        RazorpayOrderResponse response = paymentService.createRazorpayOrder();
        return ResponseEntity.ok(ApiResponse.<RazorpayOrderResponse>builder()
                .success(true)
                .message("Payment order created")
                .data(response)
                .build());
    }
}