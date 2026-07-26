package com.smartcart.backend.controller;

import com.smartcart.backend.dto.ApiResponse;
import com.smartcart.backend.dto.WishlistResponse;
import com.smartcart.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getMyWishlist() {
        List<WishlistResponse> wishlist = wishlistService.getMyWishlist();
        return ResponseEntity.ok(ApiResponse.<List<WishlistResponse>>builder()
                .success(true)
                .message("Wishlist fetched successfully")
                .data(wishlist)
                .build());
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> addToWishlist(@PathVariable Long productId) {
        wishlistService.addToWishlist(productId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Added to wishlist")
                .data(null)
                .build());
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(@PathVariable Long productId) {
        wishlistService.removeFromWishlist(productId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Removed from wishlist")
                .data(null)
                .build());
    }
}