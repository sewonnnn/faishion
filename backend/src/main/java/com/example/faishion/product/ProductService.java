package com.example.faishion.product;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    // 상품목록 전체 불러오기
    public List<Product> findAll() {
        return productRepository.findAll();
    }
}
