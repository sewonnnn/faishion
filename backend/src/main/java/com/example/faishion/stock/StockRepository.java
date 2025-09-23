package com.example.faishion.stock;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Integer> {

    public Stock findByProductId(Long productId);

    // stock정보로 stockId 찾기
    Optional<Stock> findByProductIdAndColorAndSize(Long productId, String color, String size);
}
