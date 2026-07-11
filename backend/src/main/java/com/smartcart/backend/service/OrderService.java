package com.smartcart.backend.service;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.entity.*;
import com.smartcart.backend.exception.ApiException;
import com.smartcart.backend.repository.*;
import com.smartcart.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final SecurityUtil securityUtil;


    private final PaymentService paymentService; // add this field with other repositories

    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        User user = getCurrentUser();

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Cart not found", HttpStatus.NOT_FOUND));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new ApiException("Cart is empty", HttpStatus.BAD_REQUEST);
        }

        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new ApiException(
                        "Insufficient stock for " + product.getName() + ". Only " + product.getStockQuantity() + " left",
                        HttpStatus.BAD_REQUEST
                );
            }
        }

        // ---------- Payment verification (only if Razorpay details are present) ----------
        Order.PaymentStatus paymentStatus = Order.PaymentStatus.PENDING; // COD default

        boolean isOnlinePayment = request.getRazorpayOrderId() != null && !request.getRazorpayOrderId().isBlank();

        if (isOnlinePayment) {
            boolean valid = paymentService.verifySignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );
            if (!valid) {
                throw new ApiException("Payment verification failed", HttpStatus.PAYMENT_REQUIRED);
            }
            paymentStatus = Order.PaymentStatus.PAID;
        }

        BigDecimal totalAmount = cartItems.stream()
                .map(item -> item.getPriceAtAdd().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .user(user)
                .totalAmount(totalAmount)
                .status(Order.OrderStatus.PENDING)
                .deliveryAddress(request.getDeliveryAddress())
                .paymentStatus(paymentStatus)
                .razorpayOrderId(request.getRazorpayOrderId())
                .razorpayPaymentId(request.getRazorpayPaymentId())
                .build();
        order = orderRepository.save(order);

        for (CartItem item : cartItems) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(item.getProduct())
                    .quantity(item.getQuantity())
                    .priceAtPurchase(item.getPriceAtAdd())
                    .build();
            orderItemRepository.save(orderItem);

            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        cartItemRepository.deleteAll(cartItems);

//        budgetRepository.findByUserId(user.getId()).ifPresent(budget -> {
//            budget.setCurrentSpent(BigDecimal.ZERO);
//            budgetRepository.save(budget);
//        });

        return mapToResponse(order);
    }



    // ---------- Get logged-in user's order history ----------
    public List<OrderResponse> getMyOrders() {
        User user = getCurrentUser();
        return orderRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));
        return mapToResponse(order);
    }

    // ---------- ADMIN: view all orders ----------
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ---------- ADMIN: update order status ----------
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        order.setStatus(request.getStatus());
        order = orderRepository.save(order);

        return mapToResponse(order);
    }

    // ================= PRIVATE HELPERS =================

    private User getCurrentUser() {
        String email = securityUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItem> items = orderItemRepository.findAll()
                .stream()
                .filter(oi -> oi.getOrder().getId().equals(order.getId()))
                .toList();


        List<OrderItemResponse> itemResponses = items.stream().map(item -> {
            BigDecimal subtotal = item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()));
            return OrderItemResponse.builder()
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .imageUrl(item.getProduct().getImageUrl())
                    .quantity(item.getQuantity())
                    .priceAtPurchase(item.getPriceAtPurchase())
                    .subtotal(subtotal)
                    .build();
        }).toList();

        // Check if a delivery boy has been assigned
        String deliveryBoyName = null;
        String deliveryBoyPhone = null;
        var assignmentOpt = deliveryAssignmentRepository.findAll().stream()
                .filter(da -> da.getOrder().getId().equals(order.getId()))
                .findFirst();

        if (assignmentOpt.isPresent()) {
            User deliveryBoy = assignmentOpt.get().getDeliveryBoy();
            deliveryBoyName = deliveryBoy.getName();
            deliveryBoyPhone = deliveryBoy.getPhone();
        }

        return OrderResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus().name())
                .paymentStatus(order.getPaymentStatus().name())
                .totalAmount(order.getTotalAmount())
                .deliveryAddress(order.getDeliveryAddress())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .deliveryBoyName(deliveryBoyName)
                .deliveryBoyPhone(deliveryBoyPhone)
                .build();

    }



}