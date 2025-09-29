package com.example.faishion.cart;

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

    // 사용자 ID를 받아 해당 유저의 장바구니만 조회하는 메서드 추가
    public List<CartProductDTO> findUserCartList(String userId) {
        // 1. Repository를 통해 특정 User의 Cart 리스트를 조회
        List<Cart> carts = cartRepository.findByUser_Id(userId);

        // 2. Cart 엔티티 리스트를 CartProductDTO 리스트로 변환하여 반환
        return carts.stream()
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
        // 유저와 Stock ID로 장바구니에 이미 담긴 상품이 있는지 확인
        Optional<Cart> existCartItem = cartRepository.findByUserIdAndStockId(user.getId(), stock.getId());
        System.out.println("existCartItem = " + existCartItem);
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

    // 주문 완료 시 장바구니 상품 삭제
    public void deleteCartsByIds(List<Long> cartIdsToDelete) {
        cartRepository.deleteAllById(cartIdsToDelete);
    }
}

