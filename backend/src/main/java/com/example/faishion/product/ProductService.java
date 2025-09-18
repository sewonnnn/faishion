package com.example.faishion.product;

import com.example.faishion.image.Image;
import com.example.faishion.image.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final ImageService imageService;

    // 상품목록 전체 불러오기 ho
    public List<ProductDTO> findAll() {
        return productRepository.findAll().stream()
                .map(product -> new ProductDTO(
                        product.getId(),
                        product.getName(),
                        product.getDescription(),
                        product.getPrice(),
                        product.getImageList().stream()
                                .map(Image::getId)  // 이미지 id만
                                .toList()
                ))
                .toList();
    }

    // 아이디에 맞는 상품 불러오기 ho
    public Product findById(long id) {
        return productRepository.findById(id);
    }


    public void createProduct(Product product, List<MultipartFile> files) {
        for (MultipartFile file : files) {
            try {
                Image savedImage = imageService.saveImage(file);
                product.getImageList().add(savedImage);
            } catch (Exception e) {
                throw new RuntimeException("상품 이미지 저장 실패: " + file.getOriginalFilename(), e);
            }
        }
        productRepository.save(product);
    }

}
