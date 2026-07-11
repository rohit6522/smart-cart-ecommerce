package com.smartcart.backend.controller;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        return success(cartService.getCart(), "Cart fetched successfully");
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(@Valid @RequestBody AddToCartRequest request) {
        return success(cartService.addToCart(request), "Item added to cart");
    }

    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Long cartItemId, @Valid @RequestBody UpdateCartItemRequest request) {
        return success(cartService.updateCartItem(cartItemId, request), "Cart item updated");
    }

    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(@PathVariable Long cartItemId) {
        return success(cartService.removeCartItem(cartItemId), "Item removed from cart");
    }

    @PostMapping("/budget")
    public ResponseEntity<ApiResponse<CartResponse>> setBudget(@Valid @RequestBody SetBudgetRequest request) {
        return success(cartService.setBudget(request), "Budget updated");
    }

    private ResponseEntity<ApiResponse<CartResponse>> success(CartResponse data, String message) {
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .success(true)
                .message(message)
                .data(data)
                .build());
    }
}