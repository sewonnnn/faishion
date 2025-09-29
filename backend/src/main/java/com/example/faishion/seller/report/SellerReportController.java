package com.example.faishion.seller.report;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RequiredArgsConstructor
@RestController
@RequestMapping("/seller/report")
public class SellerReportController {
    private final SellerReportService sellerReportService;

    @PostMapping("/save") // 판매자 신고 저장
    public void save(@RequestBody SellerReportDTO sellerReportDTO, @AuthenticationPrincipal UserDetails userDetails) {

        sellerReportService.save(sellerReportDTO,userDetails);
    }
}
