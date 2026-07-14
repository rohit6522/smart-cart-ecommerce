package com.smartcart.backend.service;

import com.smartcart.backend.entity.Order;
import com.smartcart.backend.entity.OrderItem;
import com.smartcart.backend.entity.User;
import com.smartcart.backend.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final OrderItemRepository orderItemRepository;

    // @Async ensures sending the email doesn't slow down or block the checkout API response
    @Async
    public void sendOrderConfirmationEmail(Order order, User user) {
        try {
            List<OrderItem> items = orderItemRepository.findAll().stream()
                    .filter(oi -> oi.getOrder().getId().equals(order.getId()))
                    .toList();

            StringBuilder itemsList = new StringBuilder();
            for (OrderItem item : items) {
                itemsList.append(String.format(
                        "- %s x%d = ₹%.2f%n",
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getPriceAtPurchase().doubleValue() * item.getQuantity()
                ));
            }

            String body = String.format(
                    """
                    Hi %s,

                    Thank you for shopping with Smart Cart! Your order has been placed successfully.

                    Order ID: #ORD-%d
                    Order Date: %s

                    Items:
                    %s
                    Total Amount: ₹%.2f
                    Payment Method: %s
                    Delivery Address: %s

                    We'll notify you once your order is out for delivery.

                    Thanks for shopping with us!
                    Smart Cart Team
                    """,
                    user.getName(),
                    order.getId(),
                    order.getCreatedAt().toLocalDate(),
                    itemsList,
                    order.getTotalAmount(),
                    order.getPaymentStatus() == Order.PaymentStatus.PAID ? "Paid Online" : "Cash on Delivery",
                    order.getDeliveryAddress()
            );

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Order Confirmed - #ORD-" + order.getId());
            message.setText(body);

            mailSender.send(message);
            log.info("Order confirmation email sent to {}", user.getEmail());

        } catch (Exception e) {
            // Never let email failure break the checkout flow - just log it
            log.error("Failed to send order confirmation email: {}", e.getMessage());
        }
    }
}