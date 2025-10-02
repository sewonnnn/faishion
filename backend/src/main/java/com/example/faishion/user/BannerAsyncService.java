package com.example.faishion.user;

import com.example.faishion.image.Image;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BannerAsyncService {
    private final BannerRepository bannerRepository;


    @Async // 이 메서드를 별도의 스레드에서 비동기로 실행
    @Transactional
    public void bannerStatusUpdate(String userId, Long productId, Image generatedImage, BannerStatus bannerStatus) {
        try {
            // 메인 트랜잭션이 이미 커밋되어 락이 해제된 상태에서 안전하게 조회 및 업데이트
            Banner banner = bannerRepository.findByUserIdAndProductId(userId, productId)
                    .orElseThrow(() -> new RuntimeException("비동기 작업 완료 후 Banner를 찾을 수 없습니다."));
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
