package com.example.faishion.order;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"orderItemList", "orderItemList.stock", "orderItemList.stock.product", "user"})
    Optional<Order> findByClientOrderId(String clientOrderId);
}
