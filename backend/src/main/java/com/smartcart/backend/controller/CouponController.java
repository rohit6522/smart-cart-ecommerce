package com.smartcart.backend.controller;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    // ---------- USER ----------
    @PostMapping("/api/user/coupon/apply")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> applyCoupon(
            @Valid @RequestBody ApplyCouponRequest request) {
        CouponValidationResponse response = couponService.validateAndPreview(request.getCode());
        return ResponseEntity.ok(ApiResponse.<CouponValidationResponse>builder()
                .success(true)
                .message("Coupon applied successfully")
                .data(response)
                .build());
    }

    // ---------- ADMIN ----------
    @GetMapping("/api/admin/coupons")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAllCoupons() {
        List<CouponResponse> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.<List<CouponResponse>>builder()
                .success(true)
                .message("Coupons fetched successfully")
                .data(coupons)
                .build());
    }

    @PostMapping("/api/admin/coupons")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(@Valid @RequestBody CouponRequest request) {
        CouponResponse coupon = couponService.createCoupon(request);
        return ResponseEntity.ok(ApiResponse.<CouponResponse>builder()
                .success(true)
                .message("Coupon created successfully")
                .data(coupon)
                .build());
    }

    @PutMapping("/api/admin/coupons/{id}")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id, @Valid @RequestBody CouponRequest request) {
        CouponResponse coupon = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.<CouponResponse>builder()
                .success(true)
                .message("Coupon updated successfully")
                .data(coupon)
                .build());
    }

    @DeleteMapping("/api/admin/coupons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Coupon deleted successfully")
                .data(null)
                .build());
    }

    @GetMapping("/api/user/coupons/my")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getMyCoupons() {
        List<CouponResponse> coupons = couponService.getMyCoupons();
        return ResponseEntity.ok(ApiResponse.<List<CouponResponse>>builder()
                .success(true)
                .message("Your coupons fetched successfully")
                .data(coupons)
                .build());
    }
}