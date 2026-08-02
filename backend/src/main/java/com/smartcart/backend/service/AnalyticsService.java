package com.smartcart.backend.service;

import com.smartcart.backend.dto.AnalyticsResponse;
import com.smartcart.backend.entity.Order;
import com.smartcart.backend.entity.OrderItem;
import com.smartcart.backend.repository.OrderItemRepository;
import com.smartcart.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public AnalyticsResponse getAnalytics() {
        List<Order> allOrders = orderRepository.findAll();

        // Only count orders that represent real completed/valid revenue
        List<Order> validOrders = allOrders.stream()
                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED
                        && o.getStatus() != Order.OrderStatus.RETURNED)
                .toList();

        // ---------- Revenue trend: last 30 days ----------
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;

        Map<String, BigDecimal> revenueByDate = new LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            revenueByDate.put(day.format(formatter), BigDecimal.ZERO);
        }

        for (Order order : validOrders) {
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            String key = orderDate.format(formatter);
            if (revenueByDate.containsKey(key)) {
                revenueByDate.merge(key, order.getTotalAmount(), BigDecimal::add);
            }
        }

        List<AnalyticsResponse.DailyRevenue> revenueTrend = revenueByDate.entrySet().stream()
                .map(e -> AnalyticsResponse.DailyRevenue.builder()
                        .date(e.getKey())
                        .revenue(e.getValue())
                        .build())
                .toList();

        // ---------- Category-wise sales ----------
        List<OrderItem> allItems = orderItemRepository.findAll();
        Map<String, BigDecimal> categoryRevenue = new HashMap<>();
        Map<String, Long> categoryOrderCount = new HashMap<>();

        for (OrderItem item : allItems) {
            if (item.getOrder().getStatus() == Order.OrderStatus.CANCELLED
                    || item.getOrder().getStatus() == Order.OrderStatus.RETURNED) {
                continue;
            }
            String category = item.getProduct().getCategory() != null ? item.getProduct().getCategory() : "Others";
            BigDecimal itemRevenue = item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()));
            categoryRevenue.merge(category, itemRevenue, BigDecimal::add);
            categoryOrderCount.merge(category, 1L, Long::sum);
        }

        List<AnalyticsResponse.CategorySales> categorySales = categoryRevenue.entrySet().stream()
                .map(e -> AnalyticsResponse.CategorySales.builder()
                        .category(e.getKey())
                        .revenue(e.getValue())
                        .orderCount(categoryOrderCount.getOrDefault(e.getKey(), 0L))
                        .build())
                .sorted((a, b) -> b.getRevenue().compareTo(a.getRevenue()))
                .toList();

        // ---------- Top 5 products by units sold ----------
        Map<String, Long> productUnits = new HashMap<>();
        Map<String, BigDecimal> productRevenue = new HashMap<>();

        for (OrderItem item : allItems) {
            if (item.getOrder().getStatus() == Order.OrderStatus.CANCELLED
                    || item.getOrder().getStatus() == Order.OrderStatus.RETURNED) {
                continue;
            }
            String name = item.getProduct().getName();
            BigDecimal itemRevenue = item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()));
            productUnits.merge(name, (long) item.getQuantity(), Long::sum);
            productRevenue.merge(name, itemRevenue, BigDecimal::add);
        }

        List<AnalyticsResponse.TopProduct> topProducts = productUnits.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> AnalyticsResponse.TopProduct.builder()
                        .productName(e.getKey())
                        .unitsSold(e.getValue())
                        .revenue(productRevenue.getOrDefault(e.getKey(), BigDecimal.ZERO))
                        .build())
                .toList();

        // ---------- Summary stats ----------
        BigDecimal totalRevenue = validOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = validOrders.size();

        BigDecimal avgOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return AnalyticsResponse.builder()
                .revenueTrend(revenueTrend)
                .categorySales(categorySales)
                .topProducts(topProducts)
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .averageOrderValue(avgOrderValue)
                .build();
    }
}