package com.example.faishion.product;

import com.example.faishion.image.Image;
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
    void createProduct(String sellerId,
                       @RequestPart("product") Product product,
                       @RequestPart("mainImages") List<MultipartFile> mainImages,
                       @RequestPart("detailImages") List<MultipartFile> detailImages,
                       @RequestPart("stockList") List<Stock> stockList,
                       @RequestPart("stockImages") List<MultipartFile> stockImages) throws IOException {
        if(sellerId == null) sellerId = "tj";
        productService.createProduct(sellerId, product, mainImages, detailImages, stockList, stockImages);
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
                                                                  Pageable pageable, HttpServletRequest request) {
        Page<Object[]> result = productService.findProductsBySearch(searchQuery, categoryId, pageable);
        List<Map<String, Object>> content = result.stream().map(objects -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    Product p = (Product) objects[0];
                    map.put("productId", p.getId());

                    map.put("brandName", "브랜드명");//임시
                    map.put("isExclusive", true);//임시
                    map.put("isRecommend", true);//임시
                    map.put("hasCoupon", true);//임시

                    LocalDateTime now = LocalDateTime.now();
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
        //return productService.findAll(searchQuery, categoryId, pageable);
    }

    // ProductDetailPage에서 id에 일치하는 상품 가져오기 ho
    @GetMapping("/{productId}")
    public ProductDetailDTO productDetail(@PathVariable Long productId, HttpServletRequest request) {
        // findById 메서드가 Optional을 반환한다고 가정
        Product findProduct = productService.findById(productId);

        if (findProduct != null) {
            // 도메인 정보를 동적으로 가져옵니다.
            String domain = request.getScheme() + "://" + request.getServerName() +
                    (request.getServerPort() == 80 || request.getServerPort() == 443 ? "" : ":" + request.getServerPort());

            return new ProductDetailDTO(findProduct, domain);
        }
        return null;
    }
    // ProductBody에 이미지 띄우기 ho
    @GetMapping("/body/{productId}")
    public Set<String> productBody(@PathVariable Long productId, HttpServletRequest request) {
        Product product = productService.findById(productId);

        if (product != null) {
            String domain = request.getScheme() + "://" + request.getServerName() +
                    (request.getServerPort() == 80 || request.getServerPort() == 443 ? "" : ":" + request.getServerPort());

            Set<String> imageUrls = product.getDetailImageList().stream()
                    .map(image -> domain + "/image/" + image.getId()) // Image 객체를 URL 문자열로 변환
                    .collect(Collectors.toSet());

//            imageUrls.forEach(url -> System.out.println("Image URL: " + url)); // 백엔드 로그 확인
            return imageUrls; // 이미지 URL 문자열의 Set을 반환
        }
        return null;
    }
}
