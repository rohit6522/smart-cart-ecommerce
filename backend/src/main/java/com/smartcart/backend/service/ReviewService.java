package com.smartcart.backend.service;

import com.smartcart.backend.dto.ReviewRequest;
import com.smartcart.backend.dto.ReviewResponse;
import com.smartcart.backend.entity.*;
import com.smartcart.backend.exception.ApiException;
import com.smartcart.backend.repository.*;
import com.smartcart.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final SecurityUtil securityUtil;

    public ReviewResponse addOrUpdateReview(Long productId, ReviewRequest request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        // Verify the user actually has a DELIVERED order containing this product
        boolean hasPurchased = orderRepository.findByUserId(user.getId()).stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                .flatMap(o -> orderItemRepository.findAll().stream()
                        .filter(oi -> oi.getOrder().getId().equals(o.getId())))
                .anyMatch(oi -> oi.getProduct().getId().equals(productId));

        if (!hasPurchased) {
            throw new ApiException("You can only review products you've purchased and received", HttpStatus.FORBIDDEN);
        }

        Review review = reviewRepository.findByProductIdAndUserId(productId, user.getId())
                .orElse(Review.builder().product(product).user(user).build());

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review = reviewRepository.save(review);

        return mapToResponse(review);
    }

    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private User getCurrentUser() {
        String email = securityUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userName(review.getUser().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}