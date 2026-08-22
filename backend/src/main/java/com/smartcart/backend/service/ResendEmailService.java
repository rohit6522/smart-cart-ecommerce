package com.smartcart.backend.service;

import com.smartcart.backend.entity.Order;
import com.smartcart.backend.entity.OrderItem;
import com.smartcart.backend.entity.Product;
import com.smartcart.backend.entity.SupportTicket;
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
public class ResendEmailService {

    @Value("${resend.api.key}")
    private String apiKey;

    @Value("${resend.sender.email}")
    private String senderEmail;

    @Value("${admin.alert.email}")
    private String adminAlertEmail;

    private final OrderItemRepository orderItemRepository;

    private WebClient buildClient() {
        return WebClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    private void sendEmail(String toEmail, String subject, String textContent) {
        try {
            Map<String, Object> payload = Map.of(
                    "from", "Smart Cart <" + senderEmail + ">",
                    "to", List.of(toEmail),
                    "subject", subject,
                    "text", textContent
            );

            buildClient().post()
                    .uri("/emails")
                    .bodyValue(payload)
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            log.info("Email sent via Resend to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email via Resend: {}", e.getMessage());
        }
    }

    @Async
    public void sendOtpEmail(User user, String otp) {
        String body = String.format(
                "Hi %s,\n\nYour Smart Cart login verification code is:\n\n%s\n\nThis code is valid for 5 minutes. If you didn't request this, please ignore this email.\n\nSmart Cart Team",
                user.getName(), otp
        );
        sendEmail(user.getEmail(), "Your Smart Cart Login Code: " + otp, body);
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

        sendEmail(user.getEmail(), "Order Confirmed - #ORD-" + order.getId(), body);
    }

    @Async
    public void sendLowStockAlert(List<Product> products) {
        StringBuilder body = new StringBuilder("The following products are running low on stock:\n\n");
        for (Product p : products) {
            body.append(String.format("- %s: only %d left (Category: %s)%n", p.getName(), p.getStockQuantity(), p.getCategory()));
        }
        body.append("\nPlease restock soon to avoid running out.\n\nSmart Cart Admin Alerts");

        sendEmail(adminAlertEmail, "⚠️ Low Stock Alert - " + products.size() + " product(s)", body.toString());
    }

    @Async
    public void sendSupportTicketAlert(SupportTicket ticket, User user) {
        String body = String.format(
                "New support ticket submitted:\n\nFrom: %s (%s)\nSubject: %s\n\nMessage:\n%s\n\nSmart Cart Support",
                user.getName(), user.getEmail(), ticket.getSubject(), ticket.getMessage()
        );
        sendEmail(adminAlertEmail, "New Support Ticket: " + ticket.getSubject(), body);
    }
}