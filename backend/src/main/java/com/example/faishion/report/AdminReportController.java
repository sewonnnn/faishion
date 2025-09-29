package com.example.faishion.report;

import com.example.faishion.seller.report.SellerReportService;
import com.example.faishion.seller.report.SellerReportRepository;
import com.example.faishion.seller.report.SellerReport;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*; // Page, Pageable, Sort
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/reports") // 💡 관리자 전용 통합 API 경로
public class AdminReportController {
    private final ReportService reportService;
    private final SellerReportService sellerReportService;
    private final SellerReportRepository sellerReportRepository; // SellerReport의 목록 조회를 위해 필요하다고 가정

    // 1. 통합 신고 목록 조회 API
    @GetMapping("/list")
    public Page<AdminReportUnifiedDTO> getUnifiedReportList(Pageable pageable) {

        // 🚨 실제로는 성능을 위해 Repository 계층에서 통합 조회 쿼리를 작성하는 것이 최적이지만,
        // 현재 구조에서는 Service를 통해 모든 데이터를 불러와 통합 처리합니다.

        // 1. 리뷰 신고 데이터 조회 및 DTO 변환
        List<AdminReportUnifiedDTO> reviewReports = reportService.findAllReports(PageRequest.of(0, 1000)).stream()
                .map(reportService::convertToUnifiedDTO)
                .collect(Collectors.toList());

        // 2. 판매자 신고 데이터 조회 및 DTO 변환
        List<AdminReportUnifiedDTO> sellerReports = sellerReportRepository.findAll().stream()
                .map(sellerReportService::convertToUnifiedDTO)
                .collect(Collectors.toList());

        // 3. 두 리스트 통합
        List<AdminReportUnifiedDTO> unifiedReports = Stream.concat(reviewReports.stream(), sellerReports.stream())
                .sorted(Comparator.comparing(AdminReportUnifiedDTO::getCreatedAt).reversed()) // 최신순 정렬
                .collect(Collectors.toList());

        // 4. 통합된 리스트를 Page 객체로 변환하여 페이징 처리
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), unifiedReports.size());
        List<AdminReportUnifiedDTO> pageContent = (start <= end) ? unifiedReports.subList(start, end) : List.of();

        return new PageImpl<>(pageContent, pageable, unifiedReports.size());
    }

    // 2. 판매자 신고 처리 완료 API (프론트엔드의 '신고 처리 완료' 버튼에 연결)
    // 💡 리뷰 신고는 기존 /report/delete/{reviewId} 엔드포인트를 그대로 사용합니다.
    @PutMapping("/seller/{reportId}/process")
    public ResponseEntity<String> processSellerReport(@PathVariable Long reportId) {
        try {
            sellerReportService.markAsProcessed(reportId);
            return ResponseEntity.ok("판매자 신고 ID: " + reportId + " 처리가 완료되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("신고 처리 중 오류가 발생했습니다.");
        }
    }
}