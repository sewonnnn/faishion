package com.example.faishion.product;

import com.example.faishion.image.Image;
import com.example.faishion.review.Review;
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/product")
public class ProductController {
    private final ProductService productService;

    @PostMapping
    void createProduct(String sellerId,
                       @RequestPart("product") Product product,
                       @RequestPart("mainImages") List<MultipartFile> mainImages,
                       @RequestPart("detailImages") List<MultipartFile> detailImages,
                       @RequestPart("stockList") List<Stock> stockList,
                       @RequestPart("stockImages") List<MultipartFile> stockImages) throws IOException {
        if(sellerId == null) sellerId = "temp";
        productService.createProduct(sellerId, product, mainImages, detailImages, stockList, stockImages);
    }

    @GetMapping("/seller/list")
    public Page<Map<String, Object>> sellerProducts(String sellerId, Pageable pageable){
        if(sellerId == null) sellerId = "temp";
        Page<Product> products = productService.sellerProducts(sellerId, pageable);
        List<Map<String, Object>> content = products.stream()
                .map(p -> {
                    Map<String, Object> map = new LinkedHashMap<>();
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
                    map.put("mainImageId", p.getMainImageList().stream().findFirst().get().getId());
                    List<Map<String, Object>> stockData = p.getStockList().stream()
                            .map(s -> {
                                Map<String, Object> stockMap = new LinkedHashMap<>();
                                stockMap.put("id", s.getId());
                                stockMap.put("size", s.getSize());
                                stockMap.put("color", s.getColor());
                                stockMap.put("quantity", s.getQuantity());
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

        LocalDateTime currentDateTime = LocalDateTime.now(); // 'now' 변수명 변경
        LocalDateTime threeDaysAgo = currentDateTime.minusDays(3);

        if (type != null && !type.isEmpty()) {
            List<Product> products = productService.findAllByType(type);

            List<Map<String, Object>> content = products.stream()
                    .map(p -> {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("productId", p.getId());
                        map.put("brandName", p.getSeller().getBusinessName());

                        map.put("isNew", p.getCreatedAt().isAfter(threeDaysAgo));
                        map.put("isSale", p.getDiscountPrice() != null && p.getDiscountPrice() > 0);
                        map.put("isBest",productService.findBestProduct(p.getReviewList()));

                        boolean isDiscounting = p.getDiscountStartDate() != null && p.getDiscountEndDate() != null && currentDateTime.isAfter(p.getDiscountStartDate()) && currentDateTime.isBefore(p.getDiscountEndDate());
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
                        map.put("reviewRating", 0.0);
                        map.put("reviewCount", 0L);

                        return map;
                    }).collect(Collectors.toList());

            return new PageImpl<>(content, pageable, content.size());
        }

        Page<Object[]> result = productService.findProductsBySearch(searchQuery, categoryId, pageable);
        List<Map<String, Object>> content = result.stream().map(objects -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    Product p = (Product) objects[0];
                    map.put("productId", p.getId());
                    map.put("brandName", p.getSeller().getBusinessName());

                    map.put("isNew", p.getCreatedAt().isAfter(threeDaysAgo));
                    map.put("isSale", p.getDiscountPrice() != null && p.getDiscountPrice() > 0);
                    map.put("isBest",productService.findBestProduct(p.getReviewList()));

                    LocalDateTime now = LocalDateTime.now(); // 이 부분은 이제 문제가 없습니다.
                    boolean isDiscounting = p.getDiscountStartDate() != null && p.getDiscountEndDate() != null && now.isAfter(p.getDiscountStartDate()) && now.isBefore(p.getDiscountEndDate());
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
                    map.put("reviewRating", objects[1]);
                    map.put("reviewCount", objects[2]);
                    return map;
                })
                .collect(Collectors.toList());
        return new PageImpl<>(content, pageable, result.getTotalElements());
    }

    @GetMapping("/{productId}")
    public ProductDetailDTO productDetail(@PathVariable Long productId, @AuthenticationPrincipal UserDetails userDetails, HttpServletRequest request) {
        Product findProduct = productService.findById(productId);
        String username = userDetails.getUsername();
        System.out.println("username: " + username);
        System.out.println("findProduct: " + findProduct.getName());
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