package com.example.faishion.product;

import com.example.faishion.image.Image;
import com.example.faishion.review.Review;
import com.example.faishion.review.ReviewService;
import com.example.faishion.stock.Stock;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/product")
public class ProductController {
    private final ProductService productService;
    private final ReviewService reviewService;

    @PostMapping
    void createProduct(@AuthenticationPrincipal UserDetails userDetails,
                       @RequestPart("product") Product product,
                       @RequestPart("mainImages") List<MultipartFile> mainImages,
                       @RequestPart("detailImages") List<MultipartFile> detailImages,
                       @RequestPart("stocks") List<Stock> stocks,
                       @RequestPart("stockImages") List<MultipartFile> stockImages) throws IOException {
        productService.createProduct(userDetails.getUsername(), product, mainImages, detailImages, stocks, stockImages);
    }

    @PutMapping
    void updateProduct(@AuthenticationPrincipal UserDetails userDetails,
                       @RequestPart("product") Product product,
                       @RequestPart("mainInfos") List<ProductImageInfoDTO> mainInfos,
                       @RequestPart(value = "mainImages", required = false) List<MultipartFile> mainImages,
                       @RequestPart("detailInfos") List<ProductImageInfoDTO> detailInfos,
                       @RequestPart(value = "detailImages", required = false) List<MultipartFile> detailImages,
                       @RequestPart("stocks") List<Stock> stocks,
                       @RequestPart("stockInfos") List<ProductImageInfoDTO> stockInfos,
                       @RequestPart(value = "stockImages", required = false) List<MultipartFile> stockImages,
                       @RequestPart(value = "deletedMainImageIds", required = false) List<Long> deletedMainImageIds,
                       @RequestPart(value = "deletedDetailImageIds", required = false) List<Long> deletedDetailImageIds,
                       @RequestPart(value = "deletedStockIds", required = false) List<Long> deletedStockIds) throws IOException {
        productService.updateProduct(userDetails.getUsername(), product, mainInfos, mainImages, detailInfos, detailImages, stocks, stockInfos, stockImages, deletedMainImageIds, deletedDetailImageIds, deletedStockIds);
    }

    @GetMapping("/seller/list")
    public Page<Map<String, Object>> sellerProducts(@AuthenticationPrincipal UserDetails userDetails, Pageable pageable){
        Page<Product> products = productService.sellerProducts(userDetails.getUsername(), pageable);
        List<Map<String, Object>> content = products.stream()
                .map(p -> {
                    Map<String, Object> map = new LinkedHashMap<>(); // Use LinkedHashMap for predictable order
                    map.put("id", p.getId());
                    map.put("name", p.getName());
                    map.put("description", p.getDescription());
                    map.put("price", p.getPrice());
                    map.put("status", p.getStatus());
                    map.put("discountPrice", p.getDiscountPrice());
                    map.put("discountStartDate", p.getDiscountStartDate());
                    map.put("discountEndDate", p.getDiscountEndDate());
                    map.put("categoryName", p.getCategory().getName());
                    map.put("categoryGroupName", p.getCategory().getCategoryGroup().getName());
                    Map<String, Object> categoryMap =Map.of(
                        "categoryGroup", Map.of(
                                "id", p.getCategory().getCategoryGroup().getId()
                        ),
                        "id", p.getCategory().getId()
                    );
                    map.put("category", categoryMap);
                    map.put("mainImageList", p.getMainImageList().stream().map(Image::getId).toList());
                    map.put("detailImageList", p.getDetailImageList().stream().map(Image::getId).toList());
                    List<Map<String, Object>> stockData = p.getStockList().stream()
                            .map(s -> {
                                Map<String, Object> stockMap = new LinkedHashMap<>(); // Use LinkedHashMap here as well
                                stockMap.put("id", s.getId());
                                stockMap.put("size", s.getSize());
                                stockMap.put("color", s.getColor());
                                stockMap.put("quantity", s.getQuantity());
                                stockMap.put("image", s.getImage().getId());
                                return stockMap;
                            })
                            .collect(Collectors.toList());
                    map.put("stockList", stockData);
                    return map;
                })
                .collect(Collectors.toList());
        return new PageImpl<>(content, pageable, products.getTotalElements());
    }

    @GetMapping("/list")
    public Page<Map<String, Object>> findProductsBySearch(@RequestParam(required = false) String searchQuery,
                                                          @RequestParam(required = false) Long categoryId,
                                                          @RequestParam(required = false) String type,
                                                          Pageable pageable, HttpServletRequest request) {

        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime threeDaysAgo = currentDateTime.minusDays(3);

        // 현재 할인 기간 중인지 확인하는 헬퍼 함수 정의
        java.util.function.Function<Product, Boolean> isCurrentlyDiscounting = p ->
                p.getDiscountStartDate() != null && p.getDiscountEndDate() != null &&
                        currentDateTime.isAfter(p.getDiscountStartDate()) && currentDateTime.isBefore(p.getDiscountEndDate());

        if (type != null && !type.isEmpty()) {
            // type 선택시 (기존 로직 유지)
            List<Product> products = productService.findAllByType(type);

            List<Map<String, Object>> content = products.stream()
                    .map(p -> {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("productId", p.getId());
                        map.put("brandName", p.getSeller().getBusinessName());

                        boolean isDiscounting = isCurrentlyDiscounting.apply(p);

                        map.put("isNew", p.getCreatedAt().isAfter(threeDaysAgo));
                        map.put("isSale", isDiscounting);
                        map.put("isBest",productService.findBestProduct(p.getReviewList()));

                        map.put("name", p.getName());
                        map.put("finalPrice", isDiscounting ? p.getDiscountPrice() : p.getPrice());

                        if(isDiscounting) {
                            map.put("originalPrice", p.getPrice());
                            map.put("discountRate", (p.getPrice() - p.getDiscountPrice()) * 100 / p.getPrice());
                        }

                        String domain = request.getScheme() + "://" + request.getServerName() +
                                (request.getServerPort() == 80 || request.getServerPort() == 443 ? "" : ":" + request.getServerPort());
                        map.put("imageUrl", p.getMainImageList().stream().findFirst().map(
                                image -> domain + "/image/" + image.getId()
                        ));

                        map.put("reviewRating", reviewService.findRatingAverage(p.getId()));
                        map.put("reviewCount", reviewService.findCountByProductId(p.getId()));

                        return map;
                    }).collect(Collectors.toList());

            return new PageImpl<>(content, pageable, content.size());
        }
        // type 미선택시 결과물
        Page<Object[]> result = productService.findProductsBySearch(searchQuery, categoryId, pageable);
        List<Map<String, Object>> content = result.stream().map(objects -> {
                    Map<String, Object> map = new LinkedHashMap<>();

                    Product p = (Product) objects[0];

                    map.put("productId", p.getId());
                    map.put("brandName", p.getSeller().getBusinessName());

                    // 현재 할인 기간 중인지 확인
                    boolean isDiscounting = isCurrentlyDiscounting.apply(p);

                    map.put("isNew", p.getCreatedAt().isAfter(threeDaysAgo));
                    map.put("isSale", isDiscounting);
                    map.put("isBest",productService.findBestProduct(p.getReviewList()));

                    map.put("name", p.getName());
                    map.put("finalPrice", isDiscounting ? p.getDiscountPrice() : p.getPrice());

                    if(isDiscounting) {
                        map.put("originalPrice", p.getPrice());
                        map.put("discountRate", (p.getPrice() - p.getDiscountPrice()) * 100 / p.getPrice());
                    }

                    String domain = request.getScheme() + "://" + request.getServerName() +
                            (request.getServerPort() == 80 || request.getServerPort() == 443 ? "" : ":" + request.getServerPort());
                    map.put("imageUrl", p.getMainImageList().stream().findFirst().map(
                            image -> domain + "/image/" + image.getId()
                    ));
                    map.put("reviewRating", objects.length > 1 ? objects[1] : 0.0);
                    map.put("reviewCount", objects.length > 2 ? objects[2] : 0L);

                    return map;
                })
                .collect(Collectors.toList());
        return new PageImpl<>(content, pageable, result.getTotalElements());
    }

    @GetMapping("/{productId}")
    public ProductDetailDTO productDetail(@PathVariable Long productId, @AuthenticationPrincipal UserDetails userDetails, HttpServletRequest request) {
        Product findProduct = productService.findById(productId);

        String username = null;
        if(userDetails != null) username = userDetails.getUsername();

        if (findProduct != null) {
            String domain = request.getScheme() + "://" + request.getServerName() +
                    (request.getServerPort() == 80 || request.getServerPort() == 443 ? "" : ":" + request.getServerPort());

            return new ProductDetailDTO(findProduct, domain, username);
        }
        return null;
    }

    @GetMapping("/body/{productId}")
    public Set<String> productBody(@PathVariable Long productId, HttpServletRequest request) {
        Product product = productService.findById(productId);
        if (product != null) {
            String domain = request.getScheme() + "://" + request.getServerName() +
                    (request.getServerPort() == 80 || request.getServerPort() == 443 ? "" : ":" + request.getServerPort());

            Set<String> imageUrls = product.getDetailImageList().stream()
                    .map(image -> domain + "/image/" + image.getId())
                    .collect(Collectors.toSet());
            return imageUrls;
        }
        return null;
    }
}