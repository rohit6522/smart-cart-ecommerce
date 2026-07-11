package com.smartcart.backend.dto;

import lombok.Data;

@Data
public class CreateRazorpayOrderRequest {
    // Empty for now - amount is calculated server-side from the user's cart,
    // never trust a client-sent amount for payments
}