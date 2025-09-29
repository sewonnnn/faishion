package com.example.faishion.report;

import com.example.faishion.seller.report.SellerReportService;
import com.example.faishion.seller.report.SellerReportRepository;
import com.example.faishion.seller.report.SellerReport;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/reports")
public class AdminReportController {
    // ReportService는 findAllReports(Pageable)을 가지고 있다고 가정
    private final ReportService reportService;
    private final SellerReportService sellerReportService;
    // SellerReportRepository는 findAll()을 제공한다고 가정
    private final SellerReportRepository sellerReportRepository;

    // 1. 통합 신고 목록 조회 API (수정)
    @GetMapping("/list")
    public Page<AdminReportUnifiedDTO> getUnifiedReportList(
            Pageable pageable,
            @RequestParam(required = false) String type, // REVIEW 또는 SELLER
            @RequestParam(required = false) String search // 검색어
    ) {
        // 1. 리뷰 신고 데이터 조회 및 DTO 변환
        // Pageable은 현재 무시하고 일단 전체 데이터를 가져와 메모리에서 필터링합니다. (성능 최적화 필요)
        List<AdminReportUnifiedDTO> reviewReports = reportService.findAllReports(PageRequest.of(0, 2000)).getContent().stream()
                .map(reportService::convertToUnifiedDTO)
                .filter(dto -> type == null || type.equalsIgnoreCase("ALL") || dto.getType().equalsIgnoreCase(type)) // 1차 필터링
                .filter(dto -> search == null || search.isEmpty() ||
                        dto.getReason().contains(search) ||
                        dto.getReporterId().contains(search) ||
                        dto.getDescription().contains(search)) // 검색 필터링
                .collect(Collectors.toList());

        // 2. 판매자 신고 데이터 조회 및 DTO 변환
        List<AdminReportUnifiedDTO> sellerReports = sellerReportRepository.findAll().stream()
                .map(sellerReportService::convertToUnifiedDTO)
                .filter(dto -> type == null || type.equalsIgnoreCase("ALL") || dto.getType().equalsIgnoreCase(type)) // 1차 필터링
                .filter(dto -> search == null || search.isEmpty() ||
                        dto.getReason().contains(search) ||
                        dto.getReporterId().contains(search) ||
                        dto.getDescription().contains(search)) // 검색 필터링
                .collect(Collectors.toList());

        // 3. 두 리스트 통합 및 정렬
        List<AdminReportUnifiedDTO> unifiedAndFilteredReports = Stream.concat(reviewReports.stream(), sellerReports.stream())
                .sorted(Comparator.comparing(AdminReportUnifiedDTO::getCreatedAt).reversed()) // 최신순 정렬
                .collect(Collectors.toList());

        // 4. PageImpl로 페이징 처리
        int total = unifiedAndFilteredReports.size();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), total);

        List<AdminReportUnifiedDTO> pageContent = (start < total) ? unifiedAndFilteredReports.subList(start, end) : List.of();

        // 🚨 프론트엔드가 요구하는 totalElements와 totalPages 정보를 담아 반환
        return new PageImpl<>(pageContent, pageable, total);
    }

    // 2. 판매자 신고 처리 완료 API (기존 유지)
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