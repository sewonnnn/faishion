package com.example.faishion.seller.report;

import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.report.AdminReportUnifiedDTO;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SellerReportService {
    private final SellerReportRepository sellerReportRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;


    // 💡 Seller Report를 통합 DTO로 변환하는 메서드
    public AdminReportUnifiedDTO convertToUnifiedDTO(SellerReport report) {
        // SellerReport 엔티티는 Product를 필드로 가집니다.
        String businessName = (report.getProduct() != null) ? report.getProduct().getSeller().getBusinessName() : "[상품 삭제됨]";

        return AdminReportUnifiedDTO.builder()
                .id(report.getId())
                .type("SELLER")
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus()) // SellerReport는 status 필드를 사용
                .reporterId(report.getReporter().getName())
                .targetId(report.getProduct().getId()) // 신고 대상 ID는 상품 ID
                .contentPreview(businessName) // 판매자의 상호명을 미리보기로 사용
                .createdAt(report.getCreatedAt())
                .build();
    }

    // 💡 Seller Report의 처리 상태를 '완료'로 변경하는 메서드 (프론트엔드 '신고 처리 완료' 버튼 로직)
    @Transactional
    public void markAsProcessed(Long reportId) {
        SellerReport report = sellerReportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 판매자 신고 ID입니다."));

        report.setStatus("처리 완료");
        sellerReportRepository.save(report);
    }
    @Transactional // 신고 저장
    public void save(SellerReportDTO sellerReportDTO, UserDetails userDetails) {
        SellerReport sellerReport = new SellerReport();
        Optional<User> user = userRepository.findById(userDetails.getUsername());
        Optional<Product> product = productRepository.findById(sellerReportDTO.getProductId());
        if(user.isPresent()){
            sellerReport.setReporter(user.get());
        }
        if(product.isPresent()){
            sellerReport.setProduct(product.get());
        }
        sellerReport.setDescription(sellerReportDTO.getDescription());
        sellerReport.setReason(sellerReportDTO.getReason());
        sellerReportRepository.save(sellerReport);
    }
}
