package com.smartcart.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. "WELCOME1000"

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType; // PERCENTAGE or FLAT

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue; // e.g. 10 (%) or 100 (flat rupees)

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal minOrderValue; // minimum cart total required

    @Column(nullable = false)
    private Boolean firstOrderOnly; // true = only for users with no prior orders

    @Column(nullable = false)
    private Boolean active;

    private LocalDateTime expiresAt; // nullable = never expires

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == null) active = true;
        if (firstOrderOnly == null) firstOrderOnly = false;
    }

    @ManyToOne
    @JoinColumn(name = "assigned_user_id")
    private User assignedUser; // null = public coupon, otherwise only this user can use it
    
    public enum DiscountType {
        PERCENTAGE, FLAT
    }
}