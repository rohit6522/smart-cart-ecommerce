package com.smartcart.backend.controller;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ---------- USER endpoints ----------

    @PostMapping("/api/user/orders/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(@Valid @RequestBody CheckoutRequest request) {
        return success(orderService.checkout(request), "Order placed successfully");
    }

    @GetMapping("/api/user/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders() {
        List<OrderResponse> orders = orderService.getMyOrders();
        return ResponseEntity.ok(ApiResponse.<List<OrderResponse>>builder()
                .success(true)
                .message("Orders fetched successfully")
                .data(orders)
                .build());
    }

    @GetMapping("/api/user/orders/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long orderId) {
        return success(orderService.getOrderById(orderId), "Order fetched successfully");
    }

    // ---------- ADMIN endpoints ----------

    @GetMapping("/api/admin/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.<List<OrderResponse>>builder()
                .success(true)
                .message("All orders fetched successfully")
                .data(orders)
                .build());
    }

    @PutMapping("/api/admin/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return success(orderService.updateOrderStatus(orderId, request), "Order status updated");
    }


    @PutMapping("/api/user/orders/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long orderId, @Valid @RequestBody CancelOrderRequest request) {
        return success(orderService.cancelOrder(orderId, request.getReason()), "Order cancelled successfully");
    }

    @PutMapping("/api/user/orders/{orderId}/return")
    public ResponseEntity<ApiResponse<OrderResponse>> requestReturn(
            @PathVariable Long orderId, @Valid @RequestBody ReturnRequest request) {
        return success(orderService.requestReturn(orderId, request.getReason()), "Return request submitted");
    }

    @PutMapping("/api/admin/orders/{orderId}/resolve-return")
    public ResponseEntity<ApiResponse<OrderResponse>> resolveReturn(
            @PathVariable Long orderId, @RequestParam boolean approve) {
        return success(orderService.resolveReturn(orderId, approve), "Return request resolved");
    }

    private ResponseEntity<ApiResponse<OrderResponse>> success(OrderResponse data, String message) {
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .success(true)
                .message(message)
                .data(data)
                .build());
    }


    @GetMapping("/api/admin/orders/export")
    public ResponseEntity<byte[]> exportOrders() {
        String csv = orderService.exportOrdersAsCsv();
        byte[] csvBytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=orders-export.csv")
                .header("Content-Type", "text/csv")
                .body(csvBytes);
    }
}