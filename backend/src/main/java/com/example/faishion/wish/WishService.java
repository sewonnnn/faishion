package com.example.faishion.wish;

import com.example.faishion.user.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

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

    // 찜 정보 삭제
    @Transactional
    public void delete(Wish wish) {
        wishRepository.delete(wish);
    }

    @Transactional
    public boolean isWishedByUser(Long productId, User user) {
        // findByUserAndProduct_Id가 Optional을 반환하므로, isPresent()로 존재 여부만 확인하면 됨
        return wishRepository.findByUserAndProduct_Id(user, productId).isPresent();
    }
}
