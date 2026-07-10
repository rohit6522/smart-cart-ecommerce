package com.smartcart.backend.repository;

import com.smartcart.backend.entity.DeliveryAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
    List<DeliveryAssignment> findByDeliveryBoyId(Long deliveryBoyId);
}