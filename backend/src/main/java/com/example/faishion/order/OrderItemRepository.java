package com.example.faishion.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // JPQL을 사용하여 쿼리를 직접 작성합니다.
    @Query("SELECT oi FROM OrderItem oi " +
            "JOIN oi.order o " +
            "JOIN o.user u " +
            "WHERE u.id = :userId " +
            "ORDER BY o.createdAt DESC")
    List<OrderItem> findOrderHistoryByUserId(@Param("userId") String userId);
}
