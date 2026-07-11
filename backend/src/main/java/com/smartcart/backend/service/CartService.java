package com.smartcart.backend.service;

import com.smartcart.backend.dto.*;
import com.smartcart.backend.entity.*;
import com.smartcart.backend.exception.ApiException;
import com.smartcart.backend.repository.*;
import com.smartcart.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;
    private final OrderRepository orderRepository;

    // ---------- Core: Add item to cart ----------
    public CartResponse addToCart(AddToCartRequest request) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new ApiException("Insufficient stock. Only " + product.getStockQuantity() + " left", HttpStatus.BAD_REQUEST);
        }

        // Check if item already in cart -> increase quantity instead of duplicate row
        List<CartItem> existingItems = cartItemRepository.findByCartId(cart.getId());
        CartItem existing = existingItems.stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + request.getQuantity());
            cartItemRepository.save(existing);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .priceAtAdd(product.getPrice())
                    .build();
            cartItemRepository.save(newItem);
        }

        return buildCartResponse(user, cart);
    }

    // ---------- Update quantity of a specific item ----------
    public CartResponse updateCartItem(Long cartItemId, UpdateCartItemRequest request) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ApiException("Cart item not found", HttpStatus.NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ApiException("This item does not belong to your cart", HttpStatus.FORBIDDEN);
        }

        if (item.getProduct().getStockQuantity() < request.getQuantity()) {
            throw new ApiException("Insufficient stock. Only " + item.getProduct().getStockQuantity() + " left", HttpStatus.BAD_REQUEST);
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return buildCartResponse(user, cart);
    }

    // ---------- Remove item from cart ----------
    public CartResponse removeCartItem(Long cartItemId) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ApiException("Cart item not found", HttpStatus.NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ApiException("This item does not belong to your cart", HttpStatus.FORBIDDEN);
        }

        cartItemRepository.delete(item);

        return buildCartResponse(user, cart);
    }

    // ---------- Get current cart + budget state ----------
    public CartResponse getCart() {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);
        return buildCartResponse(user, cart);
    }

    // ---------- Set / update total budget ----------
    public CartResponse setBudget(SetBudgetRequest request) {
        User user = getCurrentUser();
        Budget budget = budgetRepository.findByUserId(user.getId())
                .orElseGet(() -> Budget.builder()
                        .user(user)
                        .totalBudget(BigDecimal.ZERO)
                        .currentSpent(BigDecimal.ZERO)
                        .build());

        budget.setTotalBudget(request.getTotalBudget());
        budgetRepository.save(budget);

        Cart cart = getOrCreateCart(user);
        return buildCartResponse(user, cart);
    }

    // ================= PRIVATE HELPERS =================

    private User getCurrentUser() {
        String email = securityUtil.getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    // This is the KEY method: recalculates budget every time cart changes, and bundles everything together
    private CartResponse buildCartResponse(User user, Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());

        List<CartItemResponse> itemResponses = items.stream().map(item -> {
            BigDecimal subtotal = item.getPriceAtAdd().multiply(BigDecimal.valueOf(item.getQuantity()));
            return CartItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .imageUrl(item.getProduct().getImageUrl())
                    .priceAtAdd(item.getPriceAtAdd())
                    .quantity(item.getQuantity())
                    .subtotal(subtotal)
                    .build();
        }).toList();


        BigDecimal cartTotal = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Budget budget = budgetRepository.findByUserId(user.getId())
                .orElseGet(() -> budgetRepository.save(Budget.builder()
                        .user(user)
                        .totalBudget(BigDecimal.ZERO)
                        .currentSpent(BigDecimal.ZERO)
                        .build()));

// Lifetime spend = money already spent on placed orders + whatever's currently in the cart
        BigDecimal spentOnOrders = orderRepository.getTotalSpentByUser(user.getId());
        BigDecimal totalSpent = spentOnOrders.add(cartTotal);

        budget.setCurrentSpent(totalSpent);
        budgetRepository.save(budget);

        BigDecimal remaining = budget.getTotalBudget().subtract(totalSpent);
        boolean overBudget = totalSpent.compareTo(budget.getTotalBudget()) > 0
                && budget.getTotalBudget().compareTo(BigDecimal.ZERO) > 0;

        double percentageUsed = 0.0;
        if (budget.getTotalBudget().compareTo(BigDecimal.ZERO) > 0) {
            percentageUsed = totalSpent
                    .divide(budget.getTotalBudget(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }


        return CartResponse.builder()
                .cartId(cart.getId())
                .items(itemResponses)
                .cartTotal(cartTotal)
                .totalBudget(budget.getTotalBudget())
                .currentSpent(totalSpent)
                .remainingBudget(remaining)
                .overBudget(overBudget)
                .percentageUsed(percentageUsed)
                .build();
    }
}