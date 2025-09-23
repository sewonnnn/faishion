package com.example.faishion.cart;

import com.example.faishion.product.Product;
import com.example.faishion.stock.Stock;
import com.example.faishion.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;

    // 장바구니 리스트 출력
//    public List<CartProductDTO> findAllCartList() {
//        List<Cart> cartList = cartRepository.findAll();
//
//        return cartList.stream()
//                .map(CartProductDTO::new)
//                .collect(Collectors.toList());
//    }

    // 장바구니 모든 리스트
    public List<CartProductDTO> findAllCartList() {
        // Fetch Join을 사용하여 모든 상세 정보를 한 번에 가져옴
        List<Cart> cartList = cartRepository.findAllWithDetails();

        // 스트림을 이용해 각 Cart 객체를 CartProductDTO로 변환
        // DTO 생성자에서 필요한 정보를 모두 추출
        return cartList.stream()
                .map(CartProductDTO::new)
                .collect(Collectors.toList());
    }

    // 장바구니에서 선택한 상품 리스트
    public List<Cart> findCartsWithDetailsByIds(List<Long> ids) {
        // 리포지토리의 JOIN FETCH 메서드를 호출하여 데이터 조회
        return cartRepository.findCartsWithDetailsByIds(ids);
    }


//    public void save(Cart cart) {
//        cartRepository.save(cart);
//    }

    // 장바구니에 상품을 추가하는 메서드
    public void addItemToCart(User user, Stock stock, int quantity) {
        // 해당 유저와 Stock ID로 장바구니에 이미 담긴 상품이 있는지 확인
        Optional<Cart> existCartItem = cartRepository.findByUserIdAndProductId(user.getId(), stock.getProduct().getId());

        if (existCartItem.isPresent()) {
            // 이미 있다면 기존 항목의 수량 증가
            Cart cartUpdate = existCartItem.get();
            cartUpdate.setQuantity(cartUpdate.getQuantity() + quantity);
            cartRepository.save(cartUpdate);
        } else {
            // 없다면 새로운 장바구니 항목으로 저장
            Cart newCartItem = new Cart();
            newCartItem.setUser(user);
            newCartItem.setStock(stock);
            newCartItem.setQuantity(quantity);
            cartRepository.save(newCartItem);
        }

    }

    // 개별 삭제
    public void deleteCartItem(Long cartId) {
        cartRepository.deleteById(cartId);
    }

    // 선택된 상품들 삭제
    public void deleteSelectedCartItems(List<Long> cartIds) {
        cartRepository.deleteAllById(cartIds);
    }
}

