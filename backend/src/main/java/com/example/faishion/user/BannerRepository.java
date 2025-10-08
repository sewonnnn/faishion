package com.example.faishion.user;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface BannerRepository extends JpaRepository<Banner, Long> {
    Page<Banner> findAllByUserId(String userId, Pageable pageable);

    // 비동기 후처리를 위해 Lock 없이 조회하는 메서드 추가
    Optional<Banner> findByUserIdAndProductId(String userId, Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({
            @QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")
    })
    @Query("SELECT b FROM Banner b WHERE (" +
            "(:userId IS NULL AND b.user IS NULL) OR " +  // userId가 NULL이면, Banner의 user 필드가 NULL인 경우를 찾음
            "(:userId IS NOT NULL AND b.user.id = :userId) " + // userId가 NULL이 아니면, user.id가 일치하는 경우를 찾음
            ") AND b.product.id = :productId")
    Optional<Banner> findByUserIdAndProductIdForUpdate(String userId, Long productId);

    @Modifying
    @Query("UPDATE Banner b SET b.status = 'GENERATING' WHERE b.user.id = :userId AND b.product.id = :productId AND b.status = 'READY'")
    int updatePersonalStatusToGeneratingOnlyIfReady(@Param("userId") String userId, @Param("productId") Long productId);

    @Modifying
    @Query("UPDATE Banner b SET b.status = 'GENERATING' WHERE b.user IS NULL AND b.product.id = :productId AND b.status = 'READY'")
    int updateDefaultStatusToGeneratingOnlyIfReady(@Param("productId") Long productId);

    List<Banner> findByUserIdAndProductIdIn(String userId, List<Long> productIds);
}