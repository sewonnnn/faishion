package com.example.faishion.wish;

import com.example.faishion.user.User;
import lombok.RequiredArgsConstructor;
import java.util.List;
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
    public Optional<Wish> findByProductId(Long productId, User user){
        return wishRepository.findByProductIdAndUser(productId,user);
    }

    // 위시리스트 내 상품 가져오기
    public List<Wish> findByUser(User user){
        return wishRepository.findByUser(user);
    }
}
