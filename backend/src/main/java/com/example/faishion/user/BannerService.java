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
import org.springframework.stereotype.Service;

import java.util.List;

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
        return products.stream().map(product -> {
            Banner banner = bannerRepository.findWithExclusiveLock(findUserId, product.getId());
            Long aiImageId = null;
            if(banner == null){
                aiImageId = null;
                //비동기 AI 이미지(제미나이 레스트 템플릿) 생성 로직
                banner = new Banner();
            }else{
                switch (banner.getStatus()) {
                    case COMPLETED:
                        // 이미지가 성공적으로 생성되었으면 ID를 사용합니다.
                        if (banner.getImage() != null) {
                            aiImageId = banner.getImage().getId();
                        }
                        break;

                    case GENERATING:
                        aiImageId = null;
                        // AI 이미지가 생성 중이면 aiImageId는 null로 유지하거나
                        // 로딩 이미지 ID 등을 설정할 수 있습니다.
                        // 현재는 null로 유지합니다.
                        break;

                    case FAILED:
                        // 생성 실패 시 재시도 로직을 추가할 수 있습니다.
                        // 현재는 null로 유지합니다.
                        // **TODO: 재시도 로직 구현**
                        break;

                    case READY:
                        // 생성 대기 중 상태입니다.
                        // 현재는 null로 유지합니다.
                        break;

                    default:
                        // 예기치 않은 상태 처리
                        break;
                }
                aiImageId = banner.getImage().getId();
            }
            return new BannerDTO(product, aiImageId);
        }).toList();
    }


}
