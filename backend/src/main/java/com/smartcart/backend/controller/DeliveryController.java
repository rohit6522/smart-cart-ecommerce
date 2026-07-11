package com.smartcart.backend.controller;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    // ---------- ADMIN endpoints ----------

    @GetMapping("/api/admin/delivery-boys")
    public ResponseEntity<ApiResponse<List<DeliveryBoyResponse>>> getAllDeliveryBoys() {
        List<DeliveryBoyResponse> boys = deliveryService.getAllDeliveryBoys();
        return ResponseEntity.ok(ApiResponse.<List<DeliveryBoyResponse>>builder()
                .success(true)
                .message("Delivery boys fetched successfully")
                .data(boys)
                .build());
    }

    @PostMapping("/api/admin/delivery/assign")
    public ResponseEntity<ApiResponse<DeliveryAssignmentResponse>> assignDelivery(
            @Valid @RequestBody AssignDeliveryRequest request) {
        return success(deliveryService.assignDelivery(request), "Delivery assigned successfully");
    }

    // ---------- DELIVERY BOY endpoints ----------

    @GetMapping("/api/delivery/my-deliveries")
    public ResponseEntity<ApiResponse<List<DeliveryAssignmentResponse>>> getMyDeliveries() {
        List<DeliveryAssignmentResponse> deliveries = deliveryService.getMyDeliveries();
        return ResponseEntity.ok(ApiResponse.<List<DeliveryAssignmentResponse>>builder()
                .success(true)
                .message("Deliveries fetched successfully")
                .data(deliveries)
                .build());
    }

    @PutMapping("/api/delivery/{assignmentId}/status")
    public ResponseEntity<ApiResponse<DeliveryAssignmentResponse>> updateDeliveryStatus(
            @PathVariable Long assignmentId, @Valid @RequestBody UpdateDeliveryStatusRequest request) {
        return success(deliveryService.updateDeliveryStatus(assignmentId, request), "Delivery status updated");
    }

    private ResponseEntity<ApiResponse<DeliveryAssignmentResponse>> success(DeliveryAssignmentResponse data, String message) {
        return ResponseEntity.ok(ApiResponse.<DeliveryAssignmentResponse>builder()
                .success(true)
                .message(message)
                .data(data)
                .build());
    }
}