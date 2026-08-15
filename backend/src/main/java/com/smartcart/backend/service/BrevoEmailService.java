package com.smartcart.backend.service;

import com.smartcart.backend.entity.Order;
import com.smartcart.backend.entity.OrderItem;
import com.smartcart.backend.entity.User;
import com.smartcart.backend.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrevoEmailService {

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    private final OrderItemRepository orderItemRepository;

    private WebClient buildClient() {
        return WebClient.builder()
                .baseUrl("https://api.brevo.com/v3")
                .defaultHeader("api-key", apiKey)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    private void sendEmail(String toEmail, String toName, String subject, String textContent) {
        try {
            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", senderName, "email", senderEmail),
                    "to", List.of(Map.of("email", toEmail, "name", toName)),
                    "subject", subject,
                    "textContent", textContent
            );

            buildClient().post()
                    .uri("/smtp/email")
                    .bodyValue(payload)
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            log.info("Email sent via Brevo to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email via Brevo: {}", e.getMessage());
        }
    }

    @Async
    public void sendOtpEmail(User user, String otp) {
        String body = String.format(
                "Hi %s,\n\nYour Smart Cart login verification code is:\n\n%s\n\nThis code is valid for 5 minutes. If you didn't request this, please ignore this email.\n\nSmart Cart Team",
                user.getName(), otp
        );
        sendEmail(user.getEmail(), user.getName(), "Your Smart Cart Login Code: " + otp, body);
    }

    @Async
    public void sendOrderConfirmationEmail(Order order, User user) {
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
                "Hi %s,\n\nThank you for shopping with Smart Cart! Your order has been placed successfully.\n\nOrder ID: #ORD-%d\nOrder Date: %s\n\nItems:\n%s\nTotal Amount: ₹%.2f\nPayment Method: %s\nDelivery Address: %s\n\nWe'll notify you once your order is out for delivery.\n\nThanks for shopping with us!\nSmart Cart Team",
                user.getName(),
                order.getId(),
                order.getCreatedAt().toLocalDate(),
                itemsList,
                order.getTotalAmount(),
                order.getPaymentStatus() == Order.PaymentStatus.PAID ? "Paid Online" : "Cash on Delivery",
                order.getDeliveryAddress()
        );

        sendEmail(user.getEmail(), user.getName(), "Order Confirmed - #ORD-" + order.getId(), body);
    }
}