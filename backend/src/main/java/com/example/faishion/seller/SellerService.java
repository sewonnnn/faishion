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

        // 사업자번호 검증 API 호출
        if (!verifyBusinessNumber(dto.getBusinessNumber())) {
            throw new IllegalArgumentException("유효하지 않은 사업자등록번호입니다.");
        }

        Seller seller = new Seller();
        seller.setId(UUID.randomUUID().toString());
        seller.setEmail(dto.getEmail());
        seller.setPhoneNumber(dto.getPhoneNumber());
        seller.setPwHash(passwordEncoder.encode(dto.getPassword()));
        seller.setBusinessName(dto.getBusinessName());
        seller.setBusinessNumber(dto.getBusinessNumber());
        seller.setOwnerName(dto.getOwnerName());

        return sellerRepository.save(seller);
    }

    // 판매자 로그인
    public Seller loginSeller(String email, String password) {
        Seller seller = sellerRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 판매자입니다."));

        if (!passwordEncoder.matches(password, seller.getPwHash())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        return seller;
    }

    // 사업자등록번호 검증 API
    private boolean verifyBusinessNumber(String businessNumber) {
        String url = "https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=" + bizApiKey;

        // 요청 바디
        Map<String, Object> body = new HashMap<>();
        body.put("b_no", List.of(businessNumber)); // 사업자번호 배열

        // 요청 헤더
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        // RestTemplate 호출
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

        // 응답 로그 확인
        System.out.println("사업자 검증 API 응답: " + response);

        if (response == null || !response.containsKey("data")) {
            return false;
        }

        // "data" 배열 꺼내기
        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        if (data.isEmpty()) return false;

        // b_stt_cd 사용 (01 = 계속사업자, 정상)
        Object statusCode = data.get(0).get("b_stt_cd");
        String code = String.valueOf(statusCode);
        System.out.println("검증 결과 b_stt_cd = " + code);


        return "01".equals(code); // 01: 정상 사업자
    }
}
