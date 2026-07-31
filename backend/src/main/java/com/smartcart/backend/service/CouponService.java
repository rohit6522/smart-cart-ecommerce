package com.smartcart.backend.service;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.entity.Coupon;
import com.smartcart.backend.entity.Order;
import com.smartcart.backend.entity.User;
import com.smartcart.backend.exception.ApiException;
import com.smartcart.backend.repository.*;
import com.smartcart.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    // ---------- USER: validate + preview a coupon against their current cart ----------
    public CouponValidationResponse validateAndPreview(String code) {
        User user = getCurrentUser();
        BigDecimal cartTotal = getCurrentCartTotal(user.getId());

        Coupon coupon = getValidCoupon(code, user, cartTotal);
        BigDecimal discount = calculateDiscount(coupon, cartTotal);

        return CouponValidationResponse.builder()
                .code(coupon.getCode())
                .discountAmount(discount)
                .cartTotal(cartTotal)
                .finalTotal(cartTotal.subtract(discount))
                .build();
    }

    // Used internally by OrderService during checkout - re-validates for safety
    public BigDecimal getDiscountForCheckout(String code, User user, BigDecimal cartTotal) {
        Coupon coupon = getValidCoupon(code, user, cartTotal);
        return calculateDiscount(coupon, cartTotal);
    }

    private Coupon getValidCoupon(String code, User user, BigDecimal cartTotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new ApiException("Invalid coupon code", HttpStatus.NOT_FOUND));

        if (!Boolean.TRUE.equals(coupon.getActive())) {
            throw new ApiException("This coupon is no longer active", HttpStatus.BAD_REQUEST);
        }

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("This coupon has expired", HttpStatus.BAD_REQUEST);
        }

        if (coupon.getAssignedUser() != null && !coupon.getAssignedUser().getId().equals(user.getId())) {
            throw new ApiException("This coupon is not valid for your account", HttpStatus.FORBIDDEN);
        }

        if (cartTotal.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new ApiException(
                    "Minimum order value of ₹" + coupon.getMinOrderValue() + " required for this coupon",
                    HttpStatus.BAD_REQUEST
            );
        }

        if (Boolean.TRUE.equals(coupon.getFirstOrderOnly())) {
            boolean hasPriorOrder = orderRepository.findByUserId(user.getId()).stream()
                    .anyMatch(o -> o.getStatus() != Order.OrderStatus.CANCELLED);
            if (hasPriorOrder) {
                throw new ApiException("This coupon is valid only on your first order", HttpStatus.BAD_REQUEST);
            }
        }

        return coupon;
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal cartTotal) {
        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            return cartTotal
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            // FLAT discount, but never more than the cart total itself
            return coupon.getDiscountValue().min(cartTotal);
        }
    }

    private BigDecimal getCurrentCartTotal(Long userId) {
        var cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Cart not found", HttpStatus.NOT_FOUND));
        List<com.smartcart.backend.entity.CartItem> items = cartItemRepository.findByCartId(cart.getId());
        return items.stream()
                .map(i -> i.getPriceAtAdd().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private User getCurrentUser() {
        String email = securityUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    // ================= ADMIN: manage coupons =================

    public CouponResponse createCoupon(CouponRequest request) {
        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue())
                .firstOrderOnly(request.getFirstOrderOnly())
                .active(request.getActive() != null ? request.getActive() : true)
                .expiresAt(request.getExpiresAt())
                .build();
        coupon = couponRepository.save(coupon);
        return mapToResponse(coupon);
    }

    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ApiException("Coupon not found", HttpStatus.NOT_FOUND));

        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderValue(request.getMinOrderValue());
        coupon.setFirstOrderOnly(request.getFirstOrderOnly());
        coupon.setActive(request.getActive());
        coupon.setExpiresAt(request.getExpiresAt());

        coupon = couponRepository.save(coupon);
        return mapToResponse(coupon);
    }

    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    public List<CouponResponse> getMyCoupons() {
        User user = getCurrentUser();
        return couponRepository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getActive()))
                .filter(c -> c.getAssignedUser() == null || c.getAssignedUser().getId().equals(user.getId()))
                .map(this::mapToResponse)
                .toList();
    }

    private CouponResponse mapToResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderValue(coupon.getMinOrderValue())
                .firstOrderOnly(coupon.getFirstOrderOnly())
                .active(coupon.getActive())
                .expiresAt(coupon.getExpiresAt())
                .build();
    }
}