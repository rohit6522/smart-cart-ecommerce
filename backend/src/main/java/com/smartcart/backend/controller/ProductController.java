package com.smartcart.backend.controller;

import com.smartcart.backend.dto.ApiResponse;
import com.smartcart.backend.dto.ProductRequest;
import com.smartcart.backend.dto.ProductResponse;
import com.smartcart.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ---------- PUBLIC ENDPOINTS (anyone can browse) ----------

    @GetMapping("/api/products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.<List<ProductResponse>>builder()
                .success(true)
                .message("Products fetched successfully")
                .data(products)
                .build());
    }

    @GetMapping("/api/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Product fetched successfully")
                .data(product)
                .build());
    }

    // ---------- ADMIN-ONLY ENDPOINTS (protected by SecurityConfig) ----------

    @PostMapping("/api/admin/products")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Product created successfully")
                .data(product)
                .build());
    }

    @PutMapping("/api/admin/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .success(true)
                .message("Product updated successfully")
                .data(product)
                .build());
    }

    @DeleteMapping("/api/admin/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Product deleted successfully")
                .data(null)
                .build());
    }
}