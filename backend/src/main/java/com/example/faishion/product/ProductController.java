package com.example.faishion.product;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/product")
public class ProductController {
    private final ProductService productService;

    @GetMapping("/banner")
    List<String> findAllBanner() {
        List<String> mockData = new ArrayList<>();
        mockData.add("1");
        mockData.add("2");
        mockData.add("3");
        mockData.add("4");
        mockData.add("5");
        return mockData;
    }

    @GetMapping("productcard")
    List<Product> findAllProductCard() {
        List<Product> mockData = new ArrayList<>();
        mockData.add(new Product(1l,"1번째 상품","테스트용 상품입니다.",30000));
        mockData.add(new Product(2l,"2번째 상품","테스트용 상품입니다.",20000));
        mockData.add(new Product(3l,"3번째 상품","테스트용 상품입니다.",10000));
        mockData.add(new Product(4l,"4번째 상품","테스트용 상품입니다.",40000));
        mockData.add(new Product(5l,"5번째 상품","테스트용 상품입니다.",50000));
        return mockData;
    }
}
