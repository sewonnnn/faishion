package com.example.faishion.stock;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import java.util.Optional;
import java.util.*;

public interface StockRepository extends JpaRepository<Stock, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({
            @QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")
    })
    @Query("SELECT s FROM Stock s WHERE s.id = :stockId")
    Optional<Stock> findByIdForUpdate(Long stockId);

    /*
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({
            @QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")
    })
    Optional<Stock> findByProductIdAndColorAndSizeForUpdate(Long productId, String color, String size);

     */


    Optional<Stock> findByProductIdAndColorAndSize(Long productId, String color, String size);

    List<Stock> findAllByIdIn(List<Long> ids);

    List<Stock> findByProductId(Long productId);

    Optional<Stock> findById(Long stockId);

}
