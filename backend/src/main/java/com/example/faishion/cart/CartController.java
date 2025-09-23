package com.example.faishion.cart;

import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.product.ProductService;
import com.example.faishion.stock.Stock;
import com.example.faishion.stock.StockDTO;
import com.example.faishion.stock.StockRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@RequestMapping("/cart")
@RestController
public class CartController {
    private final CartService cartService;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final ProductService productService;

    // 장바구니 리스트
    @GetMapping("/list")
    public List<CartProductDTO> getCartProducts() {
        return cartService.findAllCartList();
    }

    @PostMapping("/save")
    public boolean cartSave(@RequestBody List<StockDTO> stockList) {

        User user = userRepository.getReferenceById("sewon"); // 임시 사용자 ID 사용

        for (StockDTO stockDTO : stockList) {
            Optional<Stock> stockOptional = stockRepository.findByProductIdAndColorAndSize( // 상품번호, 컬러, 사이즈로 찾기
                    stockDTO.getProductId(), stockDTO.getColor(), stockDTO.getSize());

            if (stockOptional.isPresent()) {
                Stock stock = stockOptional.get(); // 찾은상품 있으면 불러오기
                cartService.addItemToCart(user, stock, stockDTO.getQuantity()); // 카트에 담기
            } else {
                throw new EntityNotFoundException("재고 정보를 찾을 수 없습니다: " +
                        "ProductId=" + stockDTO.getProductId() +
                        ", Color=" + stockDTO.getColor() +
                        ", Size=" + stockDTO.getSize());
            }
        }
        return true;
    }

    // 개별 상품 삭제
    @DeleteMapping("/delete/{cartId}")
    public void deleteCartItem(@PathVariable Long cartId) {
        cartService.deleteCartItem(cartId);
    }

    // 선택된 상품 전체 삭제
    @PostMapping("/deletePickAll")
    public void deleteSelectedCartItems(@RequestBody Map<String, List<Long>> requestBody) {
        List<Long> cartIds = requestBody.get("cartIds");
        cartService.deleteSelectedCartItems(cartIds);
    }

}
