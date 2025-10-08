package com.example.faishion.user;

import com.example.faishion.image.Image;
import com.example.faishion.image.ImageService;
import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
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
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null); // Optional 대신 null 체크를 위해 orElse(null)
            if(user != null && user.getImage() == null){
                user = null;
            }
        }
        final User finalUser = user;
        // 관리자가 추천한 최신 상품 8개를 가져옵니다.
        Page<Product> productPage = productRepository.findByPickTrue(
                PageRequest.of(0, 8, Sort.by("updatedAt").descending())
        );
        List<Long> productIds = productPage.getContent().stream().map(Product::getId).toList();
        List<Banner> defaultBanners = bannerRepository.findByUserIdAndProductIdIn(null, productIds);
        Map<Long, Banner> defaultBannerMap = defaultBanners.stream()
                .filter(banner -> banner.getStatus() == BannerStatus.COMPLETED)
                .collect(Collectors.toMap(banner -> banner.getProduct().getId(), Function.identity()
                ));
        List<Product> filteredProducts = productPage.getContent().stream()
                .filter(product -> defaultBannerMap.containsKey(product.getId()))
                .toList();
        // 1. 개인화 배너 로드 및 Map 생성 (finalUser가 있을 경우)
        Map<Long, Banner> personalBannerMap = new HashMap<>();
        if (finalUser != null) {
            List<Long> filteredProductIds = filteredProducts.stream().map(Product::getId).toList();
            // 2-1. 개인화 배너 로드
            List<Banner> personalBanners = bannerRepository.findByUserIdAndProductIdIn(finalUser.getId(), filteredProductIds);
            personalBannerMap = personalBanners.stream()
                    .collect(Collectors.toMap(banner -> banner.getProduct().getId(), Function.identity()));

            // 2-2. **Lock 대신 조건부 업데이트를 사용해 비동기 작업 요청 (수정된 로직)**
            for (Product product : filteredProducts) {
                Banner personalBanner = personalBannerMap.get(product.getId());

                // READY 상태일 때만 비동기 작업을 시작하도록 시도
                if (personalBanner == null || personalBanner.getStatus() == BannerStatus.READY) {
                    try {
                        // 격리된 트랜잭션 (REQUIRES_NEW) 호출
                        // 이 메서드 내에서 락을 획득하고, 없으면 생성하고, 상태를 GENERATING으로 변경
                        Banner updatedBanner = bannerAsyncService.updateStatusToGeneratingWithLock(finalUser.getId(), product.getId());
                        // 메모리 Map 및 객체 상태 업데이트
                        personalBannerMap.put(product.getId(), updatedBanner);
                        // 상태 변경 성공 시 (READY -> GENERATING)에만 비동기 작업 시작
                        if (updatedBanner.getStatus() == BannerStatus.GENERATING) {
                            System.out.println("개인 배너 생성 시작");
                            Long userImageId = finalUser.getImage().getId();
                            Long defaultImageId = defaultBannerMap.get(product.getId()).getImage().getId();
                            CompletableFuture<Image> imageFuture = imageService.generateImage(List.of(userImageId, defaultImageId),
                                    "The images I have attached are referred to as **Image 1 and Image 2 in the order they were provided. CRITICAL: The face of the person in image1 must be kept identical to its original appearance in image1, without any modification or alteration whatsoever.** image1 is a full-body image of a person. image2 contains fashion items, which can include one or more complete outfits or individual pieces. Create a single photorealistic front-facing full-body image of the person from image1, explicitly showing them wearing and fully styled with all the fashion items from image2. **Ensure the fit, design, color, and texture of the clothing items are highly accurate to their source images, and exclude any clothing or accessories from image1 itself. For the background, generate a brand new background environment that captures the overall essence and stylistic feel from image2, but do not copy the original background directly. Ensure this newly generated background complements the person and their outfit naturally**, maintaining a realistic fit, natural proportions, high-quality textures, and appropriate lighting around the preserved face."
                            );
                            imageFuture.thenAcceptAsync(generatedImage -> {
                                bannerAsyncService.bannerStatusUpdate(finalUser.getId(), product.getId(), generatedImage, BannerStatus.COMPLETED);
                                System.out.println("개인 배너 생성 후 연결 완료");
                            }).exceptionally(ex -> {
                                // 이미지 생성 실패 시, 상태를 READY로 롤백
                                bannerAsyncService.bannerStatusUpdate(finalUser.getId(), product.getId(), null, BannerStatus.READY);
                                System.err.println("개인 배너 생성 실패: " + ex.getMessage());
                                return null;
                            });
                        }
                        // statusUpdated가 false인 경우: 다른 요청이 먼저 처리했으므로, 아무 작업 없이 다음 루프로 진행
                    } catch (Exception e) {
                        System.err.println("개인 배너 상태 업데이트 시도 중 예외 발생 for product " + product.getId() + ": " + e.getMessage());
                    }
                }
            }
        }
        // 3. 최종 DTO 생성 (항상 실행)
        final Map<Long, Banner> finalPersonalBannerMapRef = personalBannerMap;
        return filteredProducts.stream().map(product -> {
            Banner defaultBanner = defaultBannerMap.get(product.getId());
            // finalUser가 null이면 finalPersonalBannerMapRef는 비어있음 (get은 null 반환)
            Banner personalBanner = finalPersonalBannerMapRef.get(product.getId());
            return new BannerDTO(product, defaultBanner, personalBanner);
        }).toList();
    }

}
