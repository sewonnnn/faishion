package com.example.faishion.stock;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<Stock, Integer> {

    public Stock findByProductId(Long productId);

}
