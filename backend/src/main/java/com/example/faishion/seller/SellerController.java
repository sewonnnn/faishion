package com.example.faishion.seller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;

    // 판매자 회원가입
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody SellerDTO dto) {
        try {
            Seller seller = sellerService.registerSeller(dto);
            return ResponseEntity.ok("판매자 회원가입 성공: " + seller.getEmail());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 판매자 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody SellerDTO dto) {
        try {
            Seller seller = sellerService.loginSeller(dto.getId(), dto.getPassword());
            return ResponseEntity.ok("판매자 로그인 성공: " + seller.getId());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}
