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
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class    OrderService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final SecurityUtil securityUtil;
    private final ResendEmailService emailService;
    private final CouponService couponService;
    private final PaymentService paymentService; // add this field with other repositories
    private final NotificationService notificationService;

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


        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedCouponCode = null;

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discountAmount = couponService.getDiscountForCheckout(request.getCouponCode(), user, totalAmount);
            appliedCouponCode = request.getCouponCode().toUpperCase();
            totalAmount = totalAmount.subtract(discountAmount);
        }

        Order order = Order.builder()
                .user(user)
                .totalAmount(totalAmount)
                .status(Order.OrderStatus.PENDING)
                .deliveryAddress(request.getDeliveryAddress())
                .paymentStatus(paymentStatus)
                .razorpayOrderId(request.getRazorpayOrderId())
                .razorpayPaymentId(request.getRazorpayPaymentId())
                .couponCode(appliedCouponCode)
                .discountAmount(discountAmount)
                .build();
        order = orderRepository.save(order);

        notificationService.notify(
                user,
                "Order Placed",
                "Your order #" + order.getId() + " has been placed successfully.",
                order.getId()
        );

        List<Product> lowStockProducts = new java.util.ArrayList<>();

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

            // Flag for a low-stock alert if this order pushed it to 5 or below
            if (product.getStockQuantity() <= 5) {
                lowStockProducts.add(product);
            }
        }

        if (!lowStockProducts.isEmpty()) {
            emailService.sendLowStockAlert(lowStockProducts);
        }

        cartItemRepository.deleteAll(cartItems);

        // Send confirmation email asynchronously - doesn't block the response
        emailService.sendOrderConfirmationEmail(order, user);

        return mapToResponse(order);
    }



    // ---------- Cancel an order (only PENDING or CONFIRMED, before shipping) ----------
    @Transactional
    public OrderResponse cancelOrder(Long orderId, String reason) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ApiException("This order does not belong to you", HttpStatus.FORBIDDEN);
        }

        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new ApiException("Order can only be cancelled before it is shipped", HttpStatus.BAD_REQUEST);
        }

        // Restore stock for each item
//        List<OrderItem> items = orderItemRepository.findAll().stream()
//                .filter(oi -> oi.getOrder().getId().equals(order.getId()))
//                .toList();

        Long orderIdForFilter = order.getId();
        List<OrderItem> items = orderItemRepository.findAll().stream()
                .filter(oi -> oi.getOrder().getId().equals(orderIdForFilter))
                .toList();

        for (OrderItem item : items) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancellationReason(reason);
        order = orderRepository.save(order);

        return mapToResponse(order);
    }

    // ---------- Request a return (only within 7 days of delivery) ----------
    public OrderResponse requestReturn(Long orderId, String reason) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ApiException("This order does not belong to you", HttpStatus.FORBIDDEN);
        }

        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new ApiException("Only delivered orders can be returned", HttpStatus.BAD_REQUEST);
        }

        if (order.getDeliveredAt() == null ||
                order.getDeliveredAt().isBefore(LocalDateTime.now().minusDays(7))) {
            throw new ApiException("Return window has expired (7 days from delivery)", HttpStatus.BAD_REQUEST);
        }

        order.setStatus(Order.OrderStatus.RETURN_REQUESTED);
        order.setReturnReason(reason);
        order.setReturnRequestedAt(LocalDateTime.now());
        order = orderRepository.save(order);

        return mapToResponse(order);
    }

    // ---------- ADMIN: approve or reject a return request ----------
    @Transactional
    public OrderResponse resolveReturn(Long orderId, boolean approve) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        if (order.getStatus() != Order.OrderStatus.RETURN_REQUESTED) {
            throw new ApiException("No pending return request for this order", HttpStatus.BAD_REQUEST);
        }

        if (approve) {
            // Restore stock since the item is coming back

//            List<OrderItem> items = orderItemRepository.findAll().stream()
//                    .filter(oi -> oi.getOrder().getId().equals(order.getId()))
//                    .toList();

            Long orderIdForFilter = order.getId();
            List<OrderItem> items = orderItemRepository.findAll().stream()
                    .filter(oi -> oi.getOrder().getId().equals(orderIdForFilter))
                    .toList();


            for (OrderItem item : items) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
            order.setStatus(Order.OrderStatus.RETURNED);
        } else {
            order.setStatus(Order.OrderStatus.RETURN_REJECTED);
        }

        order = orderRepository.save(order);
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

        notificationService.notify(
                order.getUser(),
                "Order Update",
                "Your order #" + order.getId() + " is now " + request.getStatus().name().replace("_", " ") + ".",
                order.getId()
        );

        return mapToResponse(order);
    }
    // ================= PRIVATE HELPERS =================

    private User getCurrentUser() {
        String email = securityUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    private OrderResponse mapToResponse(Order order) {

        Long orderIdForFilter = order.getId();
        List<OrderItem> items = orderItemRepository.findAll().stream()
                .filter(oi -> oi.getOrder().getId().equals(orderIdForFilter))
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

        boolean canCancel = order.getStatus() == Order.OrderStatus.PENDING
                || order.getStatus() == Order.OrderStatus.CONFIRMED;

        boolean canReturn = order.getStatus() == Order.OrderStatus.DELIVERED
                && order.getDeliveredAt() != null
                && order.getDeliveredAt().isAfter(LocalDateTime.now().minusDays(7));

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
                .cancellationReason(order.getCancellationReason())
                .returnReason(order.getReturnReason())
                .deliveredAt(order.getDeliveredAt() != null ? order.getDeliveredAt().toString() : null)
                .returnRequestedAt(order.getReturnRequestedAt() != null ? order.getReturnRequestedAt().toString() : null)
                .canCancel(canCancel)
                .canReturn(canReturn)
                .couponCode(order.getCouponCode())
                .discountAmount(order.getDiscountAmount())
                .build();

    }



}