package com.example.faishion.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"orderItemList", "orderItemList.stock", "orderItemList.stock.product", "user"})
    Optional<Order> findByClientOrderId(String clientOrderId);

    @Query("SELECT DISTINCT o FROM Order o " +
            "JOIN o.orderItemList oi " +
            "JOIN oi.stock s " +
            "JOIN s.product p " +
            "JOIN p.seller seller " +
            "WHERE seller.id = :sellerId")
    Page<Order> findOrdersBySellerId(@Param("sellerId") String sellerId, Pageable pageable);
}
