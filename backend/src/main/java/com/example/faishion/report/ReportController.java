package com.example.faishion.report;

import com.example.faishion.review.Review;
import com.example.faishion.review.ReviewService;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/report")
public class ReportController {
    private final ReportService reportService;
    private final ReviewService reviewService;
    private final UserRepository userRepository;
    // 리뷰 신고하기
    @PostMapping("/isReported")
    public ResponseEntity<String> isReported(@RequestBody ReportDTO reportDTO, @AuthenticationPrincipal UserDetails userDetails) {
        Review review = reviewService.findById(reportDTO.getReviewId()); // 신고당한 리뷰 가져오기
        boolean isReported = review.isReported();
        if(isReported){
            return  ResponseEntity.ok("이미 신고한 리뷰입니다.");
        }else{
            Report report = new Report();

            Optional<User> userOptional = userRepository.findById(userDetails.getUsername()); //임시 아이디
            if (!userOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인한 사용자를 찾을 수 없습니다.");
            }
            User user = userOptional.get();
            report.setReview(review); // 신고당한 리뷰 저장
            report.setReporter(user); // 신고자
            report.setReason(reportDTO.getReason()); // 신고 사유
            report.setDescription(reportDTO.getDescription()); // 상세내용
            reportService.save(report);
            reviewService.reportReview(reportDTO.getReviewId()); // 리뷰 테이블 is_reported 상태값 변경
            return ResponseEntity.ok("신고가 정상적으로 되었습니다.");
        }
    }
}
