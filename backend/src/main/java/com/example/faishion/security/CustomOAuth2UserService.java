//package com.example.faishion.security;
//
//import com.example.faishion.user.User;
//import com.example.faishion.user.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
//import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
//import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.stereotype.Service;
//
//import java.util.*;
//
//@Service
//@RequiredArgsConstructor
//public class CustomOAuth2UserService extends DefaultOAuth2UserService {
//
//    private final UserRepository userRepo;
//
//    @Override
//    public OAuth2User loadUser(OAuth2UserRequest req) {
//        OAuth2User oAuth2User = super.loadUser(req);
//
//        String regId = req.getClientRegistration().getRegistrationId(); // "naver"
//        Map<String, Object> attrs = oAuth2User.getAttributes();
//
//        //  네이버 전용 파싱
//        if ("naver".equals(regId)) {
//            @SuppressWarnings("unchecked")
//            Map<String, Object> resp = (Map<String, Object>) attrs.get("response");
//
//            String naverId = Objects.toString(resp.get("id"), null);
//            String email   = Objects.toString(resp.get("email"), null);
//            String name    = Objects.toString(resp.getOrDefault("name", "네이버사용자"));
//            String mobile  = Objects.toString(resp.getOrDefault("mobile", ""), "");
//
//            if (email == null) {
//                // 동의 항목에서 이메일을 안 주면 unique 식별이 애매 → id 기반으로 임시 이메일 생성
//                email = "naver_" + naverId + "@placeholder.local";
//            }
//
//            // 존재하면 사용, 없으면 생성 (비번은 null / phoneNumber는 빈 문자열로)
//            userRepo.findByEmail(email).orElseGet(() -> {
//                User u = new User();
//                u.setId("naver_" + naverId);  // PK(String)
//                u.setProvider("naver");
//                u.setName(name);
//                u.setEmail(email);
//                u.setPhoneNumber(mobile == null ? "" : mobile); // 컬럼이 not null이라 빈문자 사용
//                // 소셜은 비번 없음
//                return userRepo.save(u);
//            });
//
//            // 스프링 시큐리티 세션에 들어갈 OAuth2User (권한은 간단히 USER 1개)
//            Map<String, Object> flat = new HashMap<>();
//            flat.put("id", naverId);
//            flat.put("email", email);
//            flat.put("name", name);
//            flat.put("mobile", mobile);
//
//            return new DefaultOAuth2User(
//                    List.of(() -> "ROLE_USER"),
//                    flat,              // 평탄화한 맵 (success handler에서 다루기 편함)
//                    "email"            // principal name attribute key
//            );
//        }
//
//        // 기본값(추가 공급자 붙일 때 사용)
//        return oAuth2User;
//    }
//}
