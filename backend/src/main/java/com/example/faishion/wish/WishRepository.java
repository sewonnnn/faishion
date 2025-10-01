package com.example.faishion.wish;


import com.example.faishion.product.Product;
import com.example.faishion.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WishRepository extends JpaRepository<Wish,Integer> {

    // 유저한테 해당 상품이 위시리스트에 있는지 확인
    Optional<Wish> findByProductIdAndUser(Long productId,User user);


    // 유저에 해당하는 위시리스트 목록 가져오기
    List<Wish> findByUser(User user);

    int countByProduct(Product product);
    Optional<Object> findByUserAndProduct_Id(User user, Long productId);

}
