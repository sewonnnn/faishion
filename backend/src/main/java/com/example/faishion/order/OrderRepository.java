package com.example.faishion.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"orderItemList", "orderItemList.stock", "orderItemList.stock.product", "user"})
    Optional<Order> findByClientOrderId(String clientOrderId);

    @Query("SELECT o FROM Order o " +
            "JOIN o.orderItemList oi " +
            "JOIN oi.stock s " +
            "JOIN s.product p " +
            "LEFT JOIN o.deliveryList dl " +
            "WHERE p.seller.id = :sellerId " +
            "AND o.status = 'COMPLETED' " +
            "AND (dl IS NULL OR dl.seller.id = :sellerId) " +
            "ORDER BY o.createdAt DESC ")
    Page<Order> findBySellerId(@Param("sellerId") String sellerId, Pageable pageable);

    // 주문 상태가 Complet인 경우만 가져오기
    @Query("SELECT o FROM Order o WHERE o.user.id = :username AND o.status = 'COMPLETED' ORDER BY o.updatedAt DESC")
    List<Order> getCompleteOrder(@Param("username") String username);
}
