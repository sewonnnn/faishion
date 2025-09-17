package com.example.faishion.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    // 상품 전체 불러오기
    List<Product> findAllBy();

    // id 일치 하는 상품 가져오기 ho
    Product findById(long id);
}
