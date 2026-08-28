package com.smartcart.backend.service;
import com.smartcart.backend.dto.*;
import com.smartcart.backend.entity.Product;
import com.smartcart.backend.exception.ApiException;
import com.smartcart.backend.repository.ProductRepository;
import com.smartcart.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

import java.math.RoundingMode;
import java.util.Map;
import java.util.stream.Collectors;
import com.smartcart.backend.entity.Review;
import com.smartcart.backend.entity.ProductVariant;

import com.smartcart.backend.repository.ProductVariantRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final ProductVariantRepository variantRepository;

    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .discountPercentage(request.getDiscountPercentage())
                .stockQuantity(request.getStockQuantity())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .build();

        product = productRepository.save(product);

        if (request.getVariants() != null) {
            for (VariantRequest v : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .variantType(v.getVariantType())
                        .variantValue(v.getVariantValue())
                        .stockQuantity(v.getStockQuantity())
                        .build();
                variantRepository.save(variant);
            }
        }

        return mapToResponse(product);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscountPercentage(request.getDiscountPercentage());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());

        product = productRepository.save(product);

        variantRepository.deleteByProductId(product.getId());
        if (request.getVariants() != null) {
            for (VariantRequest v : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .variantType(v.getVariantType())
                        .variantValue(v.getVariantValue())
                        .stockQuantity(v.getStockQuantity())
                        .build();
                variantRepository.save(variant);
            }
        }

        return mapToResponse(product);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ApiException("Product not found", HttpStatus.NOT_FOUND);
        }
        productRepository.deleteById(id);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
        return mapToResponse(product);
    }

    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();

        // Batch-fetch all reviews and variants ONCE instead of per-product (avoids N+1 queries)
        List<Review> allReviews = reviewRepository.findAll();
        List<ProductVariant> allVariants = variantRepository.findAll();

        Map<Long, List<Review>> reviewsByProduct = allReviews.stream()
                .collect(Collectors.groupingBy(r -> r.getProduct().getId()));

        Map<Long, List<ProductVariant>> variantsByProduct = allVariants.stream()
                .collect(Collectors.groupingBy(v -> v.getProduct().getId()));

        return products.stream()
                .map(p -> mapToResponseBatched(p, reviewsByProduct.getOrDefault(p.getId(), List.of()),
                        variantsByProduct.getOrDefault(p.getId(), List.of())))
                .toList();
    }

    private ProductResponse mapToResponseBatched(Product product, List<Review> reviews, List<ProductVariant> variants) {
        BigDecimal discountPct = product.getDiscountPercentage() != null
                ? product.getDiscountPercentage()
                : BigDecimal.ZERO;

        BigDecimal discountedPrice = product.getPrice();
        if (discountPct.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmount = product.getPrice()
                    .multiply(discountPct)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            discountedPrice = product.getPrice().subtract(discountAmount);
        }

        double avgRating = reviews.isEmpty() ? 0.0
                : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

        List<VariantResponse> variantResponses = variants.stream()
                .map(v -> VariantResponse.builder()
                        .id(v.getId())
                        .variantType(v.getVariantType())
                        .variantValue(v.getVariantValue())
                        .stockQuantity(v.getStockQuantity())
                        .build())
                .toList();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPercentage(discountPct)
                .discountedPrice(discountedPrice)
                .stockQuantity(product.getStockQuantity())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .createdAt(product.getCreatedAt())
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .totalReviews((long) reviews.size())
                .variants(variantResponses)
                .build();
    }

    public BulkUploadResponse bulkUploadFromCsv(org.springframework.web.multipart.MultipartFile file) {
        List<String> errors = new java.util.ArrayList<>();
        int successCount = 0;
        int failureCount = 0;

        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(file.getInputStream()))) {

            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new ApiException("CSV file is empty", HttpStatus.BAD_REQUEST);
            }

            // Expected header: name,description,price,discountPercentage,stockQuantity,category,imageUrl
            String line;
            int rowNumber = 1;

            while ((line = reader.readLine()) != null) {
                rowNumber++;
                if (line.isBlank()) continue;

                try {
                    String[] fields = parseCsvLine(line);

                    if (fields.length < 6) {
                        errors.add("Row " + rowNumber + ": expected at least 6 columns, found " + fields.length);
                        failureCount++;
                        continue;
                    }

                    String name = fields[0].trim();
                    String description = fields[1].trim();
                    BigDecimal price = new BigDecimal(fields[2].trim());
                    BigDecimal discountPercentage = fields[3].trim().isEmpty()
                            ? BigDecimal.ZERO : new BigDecimal(fields[3].trim());
                    Integer stockQuantity = Integer.parseInt(fields[4].trim());
                    String category = fields[5].trim();
                    String imageUrl = fields.length > 6 ? fields[6].trim() : "";

                    if (name.isEmpty()) {
                        errors.add("Row " + rowNumber + ": product name is required");
                        failureCount++;
                        continue;
                    }

                    Product product = Product.builder()
                            .name(name)
                            .description(description)
                            .price(price)
                            .discountPercentage(discountPercentage)
                            .stockQuantity(stockQuantity)
                            .category(category)
                            .imageUrl(imageUrl)
                            .build();

                    productRepository.save(product);
                    successCount++;

                } catch (NumberFormatException e) {
                    errors.add("Row " + rowNumber + ": invalid number format (" + e.getMessage() + ")");
                    failureCount++;
                } catch (Exception e) {
                    errors.add("Row " + rowNumber + ": " + e.getMessage());
                    failureCount++;
                }
            }

        } catch (java.io.IOException e) {
            throw new ApiException("Failed to read CSV file: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return BulkUploadResponse.builder()
                .successCount(successCount)
                .failureCount(failureCount)
                .errors(errors)
                .build();
    }

    // Simple CSV line parser that handles basic comma-separated values
    private String[] parseCsvLine(String line) {
        return line.split(",", -1);
    }

    private ProductResponse mapToResponse(Product product) {
        BigDecimal discountPct = product.getDiscountPercentage() != null
                ? product.getDiscountPercentage()
                : BigDecimal.ZERO;

        BigDecimal discountedPrice = product.getPrice();
        if (discountPct.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmount = product.getPrice()
                    .multiply(discountPct)
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            discountedPrice = product.getPrice().subtract(discountAmount);
        }

        Double avgRating = reviewRepository.getAverageRating(product.getId());
        Long reviewCount = reviewRepository.getReviewCount(product.getId());

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPercentage(discountPct)
                .discountedPrice(discountedPrice)
                .stockQuantity(product.getStockQuantity())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .createdAt(product.getCreatedAt())
            .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .totalReviews(reviewCount != null ? reviewCount : 0L)
                .build();

    }
}