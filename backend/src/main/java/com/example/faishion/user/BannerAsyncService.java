package com.example.faishion.user;

import com.example.faishion.image.Image;
import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BannerAsyncService {
    private final BannerRepository bannerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW) // Lock 획득을 위해 새로운 트랜잭션 시작
    public Banner updateStatusToGeneratingWithLock(String userId, Long productId) {
        Optional<Banner> bannerOptional = bannerRepository.findByUserIdAndProductIdForUpdate(userId, productId);
        Banner banner;
        if (bannerOptional.isPresent()) {
            // 2. Banner가 이미 존재하면 Lock 획득 성공 (또는 대기 후 획득)
            banner = bannerOptional.get();
        } else {
            // 3. Banner가 존재하지 않으면, 새로 생성하고 상태를 READY로 설정
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new EntityNotFoundException("Product not found for Banner creation."));
            banner = new Banner();
            banner.setUser(userId == null ? null : userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found for Banner creation")));
            banner.setProduct(product);
            banner.setStatus(BannerStatus.READY);
            // save를 통해 영속화 (Lock 트랜잭션 내에서 처리되므로 커밋 시 반영)
            banner = bannerRepository.save(banner);
        }
        // 4. 상태가 READY일 경우에만 GENERATING으로 업데이트
        if (banner.getStatus() == BannerStatus.READY) {
            // Thread A: READY -> GENERATING으로 변경!
            banner.setStatus(BannerStatus.GENERATING);
            return bannerRepository.save(banner);
        }
        // Thread B: 이미 GENERATING이므로 이 조건문 통과
        // 상태 변경을 하지 않았으므로 null 반환
        return null;
    }

    @Async // 이 메서드를 별도의 스레드에서 비동기로 실행
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void bannerStatusUpdate(String userId, Long productId, Image generatedImage, BannerStatus bannerStatus) {
        try {
            // 메인 트랜잭션이 이미 커밋되어 락이 해제된 상태에서 안전하게 조회 및 업데이트
            Banner banner = bannerRepository.findByUserIdAndProductId(userId, productId)
                    .orElseThrow(() -> new EntityNotFoundException("비동기 작업 완료 후 Banner를 찾을 수 없습니다."));
            banner.setImage(generatedImage);
            banner.setStatus(bannerStatus);
            bannerRepository.save(banner);

        } catch (Exception e) {
            // 로깅 또는 상태 롤백 처리 (예: 상태를 FAILED로 변경)
            System.err.println("비동기 Banner 업데이트 중 치명적 오류: " + e.getMessage());
            // 필요한 경우 handleFailureByProductId(productId) 호출
        }
    }

}
