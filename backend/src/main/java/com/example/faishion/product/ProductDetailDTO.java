package com.example.faishion.product;

import com.example.faishion.image.Image;
import com.example.faishion.stock.Stock;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
public class ProductDetailDTO {
    private Long id;
    private String name;
    private String brand;
    private int price;
    private int originalPrice;
    private int discountRate;
    private Set<String> imageUrls;
    private LocalDateTime discountStartDate;
    private LocalDateTime discountEndDate;
    private String username;
    private Map<String, Map<String, Integer>> stockByColorAndSize;

    public ProductDetailDTO(Product product, String domain,  String username) {
        this.id = product.getId();
        this.name = product.getName();
        this.brand = product.getSeller().getBusinessName();
        this.username = username;
        // 가격 정보 설정
        boolean isDiscounting = product.getDiscountStartDate() != null && product.getDiscountEndDate() != null &&
                LocalDateTime.now().isAfter(product.getDiscountStartDate()) && LocalDateTime.now().isBefore(product.getDiscountEndDate());

        if (isDiscounting) {
            this.price = product.getDiscountPrice();
            this.originalPrice = product.getPrice();
            this.discountRate = (int) ((double)(product.getPrice() - product.getDiscountPrice()) / product.getPrice() * 100);
        } else {
            this.price = product.getPrice();
            this.originalPrice = product.getPrice();
            this.discountRate = 0;
        }

        this.discountStartDate = product.getDiscountStartDate();
        this.discountEndDate = product.getDiscountEndDate();

        // 이미지 URL 설정
        this.imageUrls = product.getMainImageList().stream()
                .map(image -> domain + "/image/" + image.getId())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        // ✨ 추가된 재고 정보 매핑 로직
        // stockList가 null이 아닐 때만 스트림을 처리하도록 방어 코드 추가
        if (product.getStockList() != null) {
            this.stockByColorAndSize = product.getStockList().stream()
                    .collect(Collectors.groupingBy(
                            stock -> stock.getColor(),
                            LinkedHashMap::new,
                            Collectors.toMap(
                                    stock -> stock.getSize(),
                                    stock -> stock.getQuantity(),
                                    (existing, replacement) -> existing,
                                    LinkedHashMap::new
                            )
                    ));
        } else {
            this.stockByColorAndSize = new LinkedHashMap<>();
        }
    }
}