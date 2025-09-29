package com.example.faishion.report;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;


    public AdminReportUnifiedDTO convertToUnifiedDTO(Report report) {
        // Report 엔티티는 Review를 필드로 가집니다.
        String reviewContent = (report.getReview() != null) ? report.getReview().getContent() : "[리뷰 삭제됨]";

        return AdminReportUnifiedDTO.builder()
                .id(report.getId())
                .type("REVIEW")
                .reason(report.getReason())
                .description(report.getDescription())
                .status("대기") // Review Report는 상태 필드가 없다면 '대기'로 고정
                .reporterId(report.getReporter().getName()) // UserDetails에서 ID로 사용하는 필드
                .targetId(report.getReview().getId()) // 신고 대상 ID는 리뷰 ID
                .contentPreview(reviewContent)
                .createdAt(report.getCreatedAt())
                .build();
    }
    // 관리자용: 모든 신고 목록을 페이징하여 조회
    public Page<Report> findAllReports(Pageable pageable) {
        return reportRepository.findAll(pageable);
    }
    // 🚨 리뷰 ID로 모든 신고 기록 삭제 메서드 추가
    @Transactional
    public void deleteReportsByReviewId(Long reviewId) {
        reportRepository.deleteByReviewId(reviewId);
    }
    // 관리자용: 신고 처리 상태 업데이트 (선택 사항)
    @Transactional
    public void updateReportStatus(Long reportId, String status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다."));
        report.setStatus(status);
        // reportRepository.save(report); // @Transactional 때문에 생략 가능
    }

    public Report save(Report report) {
        return reportRepository.save(report);
    }

}
