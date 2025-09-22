package com.example.faishion.wish;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WishService {

    private final WishRepository wishRepository;

    // 위시리스트 저장
    public Wish save(Wish wish){
        return wishRepository.save(wish);
    }

    // 위시리스트 내 상품 존재여부 확인
    public Optional<Wish> findByProductId(Long productId){
        return wishRepository.findByProductId(productId);
    }
}
