package com.example.faishion.user;

import com.example.faishion.image.Image;
import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.product.ProductService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerService {
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final BannerRepository bannerRepository;

    @Transactional
    public List<BannerDTO> getBannersForUser(String userId) {
        // 관리자가 추천한 최신 상품 8개를 가져옵니다.
        Page<Product> productPage = productRepository.findByPickTrue(
                PageRequest.of(0, 8, Sort.by("updatedAt").descending())
        );
        List<Product> products = productPage.getContent();
        boolean useDefaultBanners = true; // 기본적으로 userId=null인 배너를 사용한다고 가정
        if (userId != null) {
            // 실제 사용자 정보를 조회하여 프로필 이미지 유무를 판단합니다.
            User user = userRepository.findById(userId).orElseThrow();
            if (user.getImage() != null) { // User 엔티티에 getProfileImage()가 있다고 가정
                useDefaultBanners = false; // 프로필 이미지가 있으면 기본 배너를 사용하지 않음
            }
        }
        final String findUserId = useDefaultBanners ? null : userId;
        // 1. 필요한 모든 Banner를 한 번에 가져옵니다.
        List<Long> productIds = products.stream().map(Product::getId).toList();
        List<Banner> banners = bannerRepository.findByUserIdAndProductIdIn(findUserId, productIds);
        // 2. Map<ProductId, Banner>으로 변환하여 O(1) 조회 가능하게 합니다.
        Map<Long, Banner> bannerMap = banners.stream()
                .collect(Collectors.toMap(banner -> banner.getProduct().getId(), Function.identity()));
        // 3. products를 순회하며 Map에서 찾습니다. (DB 쿼리 없이 메모리에서 조회)
        return products.stream().map(product -> {
            Long aiImageId = null;
            Banner b = bannerMap.get(product.getId()); // Map에서 조회

            if (b != null && b.getStatus() == BannerStatus.COMPLETED) {
                aiImageId = b.getImage().getId();
            }
            return new BannerDTO(product, aiImageId);
        }).toList();
    }

    @Async // 이 메서드를 별도의 스레드에서 비동기로 실행
    @Transactional
    public void completeBannerUpdate(Long productId, Image generatedImage) {
        try {
            // 메인 트랜잭션이 이미 커밋되어 락이 해제된 상태에서 안전하게 조회 및 업데이트
            Banner banner = bannerRepository.findByUserIdAndProductId(null, productId)
                    .orElseThrow(() -> new RuntimeException("비동기 작업 완료 후 Banner를 찾을 수 없습니다."));

            banner.setImage(generatedImage);
            banner.setStatus(BannerStatus.COMPLETED); // 최종 상태로 업데이트
            bannerRepository.save(banner);

        } catch (Exception e) {
            // 로깅 또는 상태 롤백 처리 (예: 상태를 FAILED로 변경)
            System.err.println("비동기 Banner 업데이트 중 치명적 오류: " + e.getMessage());
            // 필요한 경우 handleFailureByProductId(productId) 호출
        }
    }

}
