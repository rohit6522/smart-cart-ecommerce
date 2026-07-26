package com.smartcart.backend.service;

import com.smartcart.backend.dto.WishlistResponse;
import com.smartcart.backend.entity.Product;
import com.smartcart.backend.entity.User;
import com.smartcart.backend.entity.Wishlist;
import com.smartcart.backend.exception.ApiException;
import com.smartcart.backend.repository.ProductRepository;
import com.smartcart.backend.repository.UserRepository;
import com.smartcart.backend.repository.WishlistRepository;
import com.smartcart.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final SecurityUtil securityUtil;

    public List<WishlistResponse> getMyWishlist() {
        User user = getCurrentUser();
        return wishlistRepository.findByUserId(user.getId())
                .stream()
                .map(w -> WishlistResponse.builder()
                        .wishlistId(w.getId())
                        .product(productService.getProductById(w.getProduct().getId()))
                        .build())
                .toList();
    }

    public void addToWishlist(Long productId) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            return; // already wishlisted, no-op
        }

        Wishlist wishlist = Wishlist.builder().user(user).product(product).build();
        wishlistRepository.save(wishlist);
    }

    public void removeFromWishlist(Long productId) {
        User user = getCurrentUser();
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    public boolean isWishlisted(Long productId) {
        User user = getCurrentUser();
        return wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
    }

    private User getCurrentUser() {
        String email = securityUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }
}