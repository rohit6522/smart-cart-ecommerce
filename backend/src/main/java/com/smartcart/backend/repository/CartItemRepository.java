package com.smartcart.backend.repository;

import com.smartcart.backend.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);
    void deleteByCartIdAndProductId(Long cartId, Long productId);
}