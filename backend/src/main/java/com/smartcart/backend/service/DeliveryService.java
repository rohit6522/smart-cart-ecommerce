package com.smartcart.backend.service;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.entity.*;
import com.smartcart.backend.exception.ApiException;
import com.smartcart.backend.repository.*;
import com.smartcart.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    // ---------- ADMIN: get list of all delivery boys ----------
    public List<DeliveryBoyResponse> getAllDeliveryBoys() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.DELIVERY_BOY)
                .map(u -> DeliveryBoyResponse.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .phone(u.getPhone())
                        .email(u.getEmail())
                        .build())
                .toList();
    }

    // ---------- ADMIN: assign an order to a delivery boy ----------
    public DeliveryAssignmentResponse assignDelivery(AssignDeliveryRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        User deliveryBoy = userRepository.findById(request.getDeliveryBoyId())
                .orElseThrow(() -> new ApiException("Delivery boy not found", HttpStatus.NOT_FOUND));

        if (deliveryBoy.getRole() != User.Role.DELIVERY_BOY) {
            throw new ApiException("Selected user is not a delivery boy", HttpStatus.BAD_REQUEST);
        }

        boolean alreadyAssigned = deliveryAssignmentRepository.findAll().stream()
                .anyMatch(da -> da.getOrder().getId().equals(order.getId()));
        if (alreadyAssigned) {
            throw new ApiException("This order is already assigned to a delivery boy", HttpStatus.CONFLICT);
        }

        DeliveryAssignment assignment = DeliveryAssignment.builder()
                .order(order)
                .deliveryBoy(deliveryBoy)
                .status(DeliveryAssignment.DeliveryStatus.ASSIGNED)
                .build();
        assignment = deliveryAssignmentRepository.save(assignment);

        // Sync order status forward
        order.setStatus(Order.OrderStatus.OUT_FOR_DELIVERY);
        orderRepository.save(order);

        return mapToResponse(assignment);
    }

    // ---------- DELIVERY BOY: get my assigned orders ----------
    public List<DeliveryAssignmentResponse> getMyDeliveries() {
        User deliveryBoy = getCurrentUser();
        return deliveryAssignmentRepository.findByDeliveryBoyId(deliveryBoy.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ---------- DELIVERY BOY: update delivery status ----------
    public DeliveryAssignmentResponse updateDeliveryStatus(Long assignmentId, UpdateDeliveryStatusRequest request) {
        User deliveryBoy = getCurrentUser();

        DeliveryAssignment assignment = deliveryAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ApiException("Delivery assignment not found", HttpStatus.NOT_FOUND));

        if (!assignment.getDeliveryBoy().getId().equals(deliveryBoy.getId())) {
            throw new ApiException("This delivery is not assigned to you", HttpStatus.FORBIDDEN);
        }

        assignment.setStatus(request.getStatus());

        if (request.getStatus() == DeliveryAssignment.DeliveryStatus.DELIVERED) {
            assignment.setDeliveredAt(LocalDateTime.now());

            // Sync the order status too
            Order order = assignment.getOrder();
            order.setStatus(Order.OrderStatus.DELIVERED);
            orderRepository.save(order);
        }

        assignment = deliveryAssignmentRepository.save(assignment);
        return mapToResponse(assignment);
    }

    // ================= PRIVATE HELPERS =================

    private User getCurrentUser() {
        String email = securityUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    private DeliveryAssignmentResponse mapToResponse(DeliveryAssignment assignment) {
        Order order = assignment.getOrder();
        User customer = order.getUser();

        return DeliveryAssignmentResponse.builder()
                .assignmentId(assignment.getId())
                .orderId(order.getId())
                .status(assignment.getStatus().name())
                .assignedAt(assignment.getAssignedAt())
                .deliveredAt(assignment.getDeliveredAt())
                .orderTotal(order.getTotalAmount())
                .deliveryAddress(order.getDeliveryAddress())
                .customerName(customer.getName())
                .customerPhone(customer.getPhone())
                .build();
    }
}