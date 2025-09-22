package com.example.faishion.wish;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishRepository extends JpaRepository<Wish,Integer> {

    public Optional<Wish> findByProductId(Long productId);
}
