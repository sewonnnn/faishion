package com.example.faishion.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;


public interface CartRepository extends JpaRepository<Cart,Long> {
    // Fetch Join을 사용 Cart 조회 시 Stock, Product, Image를 함께 가져옴
    @Query("SELECT c FROM Cart c " +
            "JOIN FETCH c.stock s " +
            "JOIN FETCH s.product p " +
            "JOIN FETCH p.seller se " + // Product에서 Seller를 조인
            "JOIN FETCH s.image i")
    List<Cart> findAllWithDetails();

    // 특정 유저와 상품 ID로 장바구니 항목 찾기
    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId AND c.stock.product.id = :productId")
    Optional<Cart> findByUserIdAndProductId(String userId, Long productId);
 }


