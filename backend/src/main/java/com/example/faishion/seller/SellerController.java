package com.example.faishion.seller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/sellers") // 💡 관리자용 API 경로 변경 (관리자 전용임을 명시)
public class SellerController {
    private final SellerService sellerService;

    // 💡 권한 확인을 위한 헬퍼 함수
    private boolean isAdmin(UserDetails userDetails) {
        if (userDetails == null) return false;

        return userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }

    // 1. 판매자 목록 조회 (GET)
    @GetMapping("/list")
    public ResponseEntity<List<SellerListDTO>> getSellerList(@AuthenticationPrincipal UserDetails userDetails) {
        if(!isAdmin(userDetails)){
            return ResponseEntity.badRequest().build();
        }
        List<SellerListDTO> sellerList = sellerService.findAllSellersForAdmin();
        sellerList.forEach(System.out::println);
        return ResponseEntity.ok(sellerList);
    }

    // 2. 판매자 삭제 (DELETE)
    @DeleteMapping("/{sellerId}")
    public ResponseEntity<String> deleteSeller(@PathVariable String sellerId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if(!isAdmin(userDetails)){
                return ResponseEntity.status(403).body("권한이 없습니다.");
            }
            sellerService.deleteSeller(sellerId);
            return ResponseEntity.ok("판매자 ID: " + sellerId + "가 성공적으로 삭제되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("판매자 삭제 중 서버 오류가 발생했습니다.");
        }
    }
}