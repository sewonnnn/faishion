package com.example.faishion.product;// ProductDetailDTO.java (수정된 코드)

import com.example.faishion.product.Product;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class ProductDetailDTO {
    private Long id;
    private String name;
    private String brand;
    private Integer price; // 최종 가격
    private Integer originalPrice; // 원가 (취소선)
    private Integer discountRate; // 할인율
    private List<String> imageUrls;
    private List<String> sizes;
    private List<String> colors;

    // ... 다른 필드

    public ProductDetailDTO(Product product, String domain) {
        this.id = product.getId();
        this.name = product.getName();
        this.brand = "BEAKER ORIGINAL"; // 임시값

        // 할인이 적용 중인지 확인
        boolean isDiscounting = product.getDiscountStartDate() != null && product.getDiscountEndDate() != null &&
                LocalDateTime.now().isAfter(product.getDiscountStartDate()) &&
                LocalDateTime.now().isBefore(product.getDiscountEndDate());

        if (isDiscounting && product.getDiscountPrice() != null) {
            // 할인이 적용 중인 경우
            this.price = product.getDiscountPrice(); // 최종 가격은 할인가
            this.originalPrice = product.getPrice(); // 원가는 정가
            this.discountRate = (int)(((double)(product.getPrice() - product.getDiscountPrice()) / product.getPrice()) * 100);
        } else {
            // 할인이 없는 경우
            this.price = product.getPrice(); // 최종 가격은 정가
            this.originalPrice = null; // 원가는 null로 설정하여 프론트에서 표시하지 않음
            this.discountRate = null; // 할인율은 null로 설정하여 표시하지 않음
        }

        // 이미지 URL 목록 생성
        this.imageUrls = product.getMainImageList().stream()
                .map(image -> domain + "/image/" + image.getId())
                .collect(Collectors.toList());

        // 사이즈 정보 추출 (기존 로직 유지)
        this.sizes = product.getStockList().stream()
                .map(stock -> stock.getSize())
                .distinct()
                .collect(Collectors.toList());
        // 컬러 정보 추출 (기존 로직 유지)
        this.colors = product.getStockList().stream()
                .map(stock -> stock.getColor())
                .distinct()
                .collect(Collectors.toList());
    }
}