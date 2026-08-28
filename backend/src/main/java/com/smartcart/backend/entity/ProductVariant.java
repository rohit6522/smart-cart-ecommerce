package com.smartcart.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String variantType; // "Size" or "Color"

    @Column(nullable = false)
    private String variantValue; // "M", "Red", etc.

    @Column(nullable = false)
    private Integer stockQuantity;
}