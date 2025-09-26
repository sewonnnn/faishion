package com.example.faishion.stock;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.*;

public interface StockRepository extends JpaRepository<Stock, Integer> {

//    public Stock findByProductId(Long productId);

    // stock정보로 stockId 찾기
    Optional<Stock> findByProductIdAndColorAndSize(Long productId, String color, String size);

    List<Stock> findAllByIdIn(List<Long> ids);

    List<Stock> findByProductId(Long productId);

    Optional<Stock> findById(Long stockId);


}
