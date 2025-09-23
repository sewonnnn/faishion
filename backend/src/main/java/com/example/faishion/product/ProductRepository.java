package com.example.faishion.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // 상품 전체 불러오기
    List<Product> findAllBy();

    @Query("SELECT DISTINCT p FROM Product p " +
            "JOIN FETCH p.category c " +
            "JOIN FETCH c.categoryGroup " +
            "JOIN FETCH p.stockList " +
            "JOIN FETCH p.mainImageList " +
            "ORDER BY p.createdAt DESC")
    Page<Product> sellerProducts(Pageable pageable);

    @Query("SELECT p FROM Product p " +
            "JOIN FETCH p.category c " +
            "JOIN FETCH c.categoryGroup " +
            "JOIN p.stockList " +
            "JOIN p.mainImageList " +
            "JOIN p.detailImageList "
    )
    Product sellerProduct();

    // id 일치 하는 상품 가져오기 ho
    Product findById(long id);

    @Query("SELECT p, COALESCE(AVG(r.rating), 0), COALESCE(COUNT(r), 0) " +
            "FROM Product p " +
            "LEFT JOIN p.reviewList r " +
            "WHERE (:categoryId IS NULL OR p.category.id = :categoryId) " +
            "AND (:searchQuery IS NULL OR p.name LIKE %:searchQuery%) " +
            "AND p.status = 1 " +
            "GROUP BY p.id, p.createdAt " + // You must group by createdAt too since you're ordering by it
            "ORDER BY p.createdAt DESC")
    Page<Object[]> findProductsBySearch(@Param("searchQuery")String searchQuery, @Param("categoryId") Long categoryId, Pageable pageable);
}
