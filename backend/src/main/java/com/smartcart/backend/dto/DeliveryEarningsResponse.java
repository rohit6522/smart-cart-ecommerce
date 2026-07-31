package com.smartcart.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryEarningsResponse {
    private long totalDeliveries;
    private long deliveriesToday;
    private long deliveriesThisMonth;
    private BigDecimal totalEarnings;
    private BigDecimal earningsToday;
    private BigDecimal earningsThisMonth;
    private BigDecimal perDeliveryFee;
}