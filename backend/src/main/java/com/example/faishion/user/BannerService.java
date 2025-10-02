package com.example.faishion.user;

import com.example.faishion.image.Image;
import com.example.faishion.image.ImageService;
import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerService {
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final BannerRepository bannerRepository;
    private final BannerAsyncService bannerAsyncService;
    private final ImageService imageService;

    @Transactional
    public List<BannerDTO> getBannersForUser(String userId) {
        // 관리자가 추천한 최신 상품 8개를 가져옵니다.
        Page<Product> productPage = productRepository.findByPickTrue(
                PageRequest.of(0, 8, Sort.by("updatedAt").descending())
        );
        List<Product> products = productPage.getContent();
        User user;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null); // Optional 대신 null 체크를 위해 orElse(null)
            if(user != null && user.getImage() == null){
                userId = null;
            }
        }
        // 1. 필요한 모든 Banner를 한 번에 가져옵니다.
        List<Long> productIds = products.stream().map(Product::getId).toList();
        List<Banner> banners = bannerRepository.findByUserIdAndProductIdIn(userId, productIds);
        // 2. Map<ProductId, Banner>으로 변환하여 O(1) 조회 가능하게 합니다.
        Map<Long, Banner> bannerMap = banners.stream()
                .collect(Collectors.toMap(banner -> banner.getProduct().getId(), Function.identity()));
        // 3. products를 순회하며 Map에서 찾습니다. (DB 쿼리 없이 메모리에서 조회)
        String finalUserId = userId;
        return products.stream().map(product -> {
            Long aiImageId = null;
            Banner banner = bannerMap.get(product.getId()); // Map에서 조회
            if (banner != null && banner.getStatus() == BannerStatus.COMPLETED) {
                aiImageId = banner.getImage().getId();
            }
            // COMPLETED가 아니거나 배너가 아예 없는 경우 & 사용자별 배너가 필요하면
            if (aiImageId == null && finalUserId != null) {
                Optional<Banner> existingBannerOptional = bannerRepository.findByUserIdAndProductId(finalUserId, product.getId());
                Banner bannerToUpdate = existingBannerOptional.orElseGet(() -> {
                    Banner newBanner = new Banner();
                    newBanner.setUser(userRepository.findById(finalUserId).orElseThrow());
                    newBanner.setProduct(productRepository.findById(product.getId()).orElseThrow());
                    return newBanner;
                });
                // 상태가 READY일 때만 이미지 생성 로직 실행
                if (bannerToUpdate.getStatus() == BannerStatus.READY) {
                    // 상태를 GENERATING으로 변경하고 DB에 저장 (현재 트랜잭션 내에서 즉시 반영)
                    bannerToUpdate.setStatus(BannerStatus.GENERATING);
                    bannerRepository.save(bannerToUpdate);
                    //System.out.println("비동기 이미지 생성 요청 시작");
                    // 비동기 이미지 생성 요청 시작
                    CompletableFuture<Image> imageFuture;
                    try {
                        Long productMainImageId = bannerToUpdate.getProduct().getMainImageList().stream().findFirst().orElseThrow().getId();
                        Long userImageId = userRepository.findById(finalUserId).orElseThrow().getImage().getId();
                        imageFuture = imageService.generateImage(List.of(productMainImageId,userImageId),
                                "");
                    } catch (IOException e) {
                        bannerToUpdate.setStatus(BannerStatus.READY);
                        // 이미지 생성 요청 실패 시 RuntimeException을 던져 트랜잭션 롤백 유도
                        throw new RuntimeException("이미지 생성 요청 실패", e);
                    }
                    // 2-3. 비동기 작업 완료 후 후속 작업 연결
                    if (imageFuture != null) {
                        imageFuture.thenAcceptAsync(generatedImage -> {
                            bannerAsyncService.bannerStatusUpdate(finalUserId, product.getId(), generatedImage, BannerStatus.COMPLETED);
                            //System.out.println("배너 생성 후 연결 완료");
                        }).exceptionally(ex -> {
                            bannerAsyncService.bannerStatusUpdate(finalUserId, product.getId(), null, BannerStatus.READY);
                            //System.err.println("비동기 이미지 생성 실패: " + ex.getMessage());
                            return null;
                        });
                    }
                }
            }
            return new BannerDTO(product, aiImageId);
        }).toList();
    }

}
