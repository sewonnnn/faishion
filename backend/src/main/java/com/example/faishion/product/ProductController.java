package com.example.faishion.product;

import com.example.faishion.image.ImageService;
import com.example.faishion.seller.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/product")
public class ProductController {
    private final ProductService productService;
    // 테마에 맞는 배너 띄우기 ho
    /*
    @GetMapping("/banner")
    List<ProductImage> findAllBanner() {
        List<ProductImage> mockData = new ArrayList<>();
        for(int i = 1; i <=5 ; i++){
            ProductImage productImage = new ProductImage();
            productImage.setOriginName("사진제목"+i);
            productImage.setSavedName("../../assets/test.jpg");
            mockData.add(productImage);
        }

        return mockData;
    }

     */

    @PostMapping
    void createProduct(@RequestPart("product") Product product, @RequestPart("images") List<MultipartFile> images){
        productService.createProduct(product, images);
    }

    @GetMapping("/list")
    public List<ProductDTO> getAllProducts() {
        return productService.findAll();
    }

    // 카테고리에 맞는 상품 목록 가져오기 ho
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

    // ProductDetailPage에서 id에 일치하는 상품 가져오기 ho
    @GetMapping("/{productId}")
    Product productDetail(@PathVariable Long productId) {
        Product findProduct  = productService.findById(productId); // db추가시 가져오기 ho
        Product mockData = new Product();
        mockData.setId(productId);

        return findProduct;
    }
}
