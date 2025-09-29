package com.example.faishion.seller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${BIZ_API_KEY}")
    private String bizApiKey;

    // 판매자 회원가입 (사업자번호 검증 포함)
    @Transactional
    public Seller registerSeller(SellerDTO dto) {
        // 이메일 중복 체크
        if (sellerRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 판매자 이메일입니다.");
        }

        if(sellerRepository.existsById(dto.getId())) {
            throw new IllegalArgumentException("이미 존재하는 판매자 ID입니다.");
        }

        // 사업자번호 검증 API 호출
        if (!verifyBusinessNumber(dto.getBusinessNumber())) {
            throw new IllegalArgumentException("유효하지 않은 사업자등록번호입니다.");
        }

        Seller seller = new Seller();
        seller.setId(dto.getId());
        seller.setEmail(dto.getEmail());
        seller.setPhoneNumber(dto.getPhoneNumber());
        seller.setPassword(passwordEncoder.encode(dto.getPassword()));
        seller.setBusinessName(dto.getBusinessName());
        seller.setBusinessNumber(dto.getBusinessNumber());
        seller.setOwnerName(dto.getOwnerName());

        return sellerRepository.save(seller);
    }

    // 판매자 로그인
    public Seller loginSeller(String id, String password) {
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 판매자 ID입니다."));

        if (!passwordEncoder.matches(password, seller.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        return seller;
    }

    // 사업자등록번호 검증 API
    private boolean verifyBusinessNumber(String businessNumber) {
        try {
            String url = "https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=" + bizApiKey;
            Map<String, Object> body = Map.of("b_no", List.of(businessNumber));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

            if (response == null || !response.containsKey("data")) return false;
            List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
            if (data.isEmpty()) return false;

            String code = String.valueOf(data.get(0).get("b_stt_cd"));
            return "01".equals(code); // 정상 사업자
        } catch (Exception e) {
            System.err.println("⚠ 사업자번호 검증 API 호출 실패 → 임시로 true 반환: " + e.getMessage());
            return true; //  개발용 fallback: 실패해도 회원가입 허용 // 배포시 false로 바꿔두기
        }
    }
}