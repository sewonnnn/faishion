package com.example.faishion.product;

import com.example.faishion.image.Image;
import com.example.faishion.image.ImageService;
import com.example.faishion.seller.SellerRepository;
import com.example.faishion.stock.Stock;
import com.example.faishion.stock.StockRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final StockRepository stockRepository;
    private final ImageService imageService;

    public List<Product> findAllById(Long id){return productRepository.findAllById(id);}
    public Page<Product> sellerProducts(String sellerId, Pageable pageable) {
        return productRepository.sellerProducts(pageable);
    }

    // 상품목록 전체 불러오기 ho
    public Page<Object[]> findProductsBySearch(String searchQuery, Long categoryId, Pageable pageable) {
       return productRepository.findProductsBySearch(searchQuery, categoryId, pageable);
    }

    // 아이디에 맞는 상품 불러오기 ho
    public Product findById(long id) {
        return productRepository.findById(id);
    }

    @Transactional
    public void createProduct(String sellerId,
                              Product product,
                              List<MultipartFile> mainImages,
                              List<MultipartFile> detailImages,
                              List<Stock> stockList,
                              List<MultipartFile> stockImages) throws IOException {
        product.setSeller(sellerRepository.getReferenceById(sellerId));
        // 1. 상품(Product) 정보 저장
        Product savedProduct = productRepository.save(product);
        // 2. 메인, 상세 이미지 처리 및 저장
        // Product 엔티티의 이미지 리스트 필드를 사용하여 관계를 설정합니다.
        for (MultipartFile file : mainImages) {
            Image image = imageService.saveImage(file);
            savedProduct.getMainImageList().add(image);
        }
        for (MultipartFile file : detailImages) {
            Image image = imageService.saveImage(file);
            savedProduct.getDetailImageList().add(image);
        }
        for (int i = 0; i < stockList.size(); i++) {
            Stock stock = stockList.get(i);
            MultipartFile stockImageFile = stockImages.get(i);
            // 이미지 저장 및 Image 엔티티 생성
            Image savedImage = imageService.saveImage(stockImageFile);
            // Stock 엔티티에 Product와 Image 연결
            stock.setProduct(savedProduct);
            stock.setImage(savedImage);
            // Stock 엔티티 저장
            stockRepository.save(stock);
        }
        // savedProduct의 이미지 리스트에 추가한 후, 저장합니다.
        productRepository.save(savedProduct);
    }

}
