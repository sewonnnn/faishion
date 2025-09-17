//package com.example.faishion.security;
//
//import com.example.faishion.user.UserRepository;
//import jakarta.servlet.http.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
//import org.springframework.stereotype.Component;
//
//import java.net.URLEncoder;
//import java.nio.charset.StandardCharsets;
//import java.util.List;
//import java.util.Map;
//
//@Component
//@RequiredArgsConstructor
//public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
//
//    private final JwtTokenProvider jwt;
//    private final UserRepository userRepo;
//
//    @Override
//    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res,
//                                        Authentication authentication) {
//        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
//        Map<String, Object> attrs = oAuth2User.getAttributes();
//
//        String email = (String) attrs.get("email"); // 우리가 flat map으로 넣어둠
//        if (email == null) email = oAuth2User.getName(); // fallback
//
//        // JWT 발급
//        String access  = jwt.generateAccess(email, List.of("ROLE_USER"));
//        String refresh = jwt.generateRefresh(email);
//
//        // ★빠른 테스트용: 쿼리스트링으로 프론트에 전달
//        String redirect = "http://localhost:5173/oauth2/success"
//                + "?token=" + URLEncoder.encode(access, StandardCharsets.UTF_8)
//                + "&refresh=" + URLEncoder.encode(refresh, StandardCharsets.UTF_8);
//
//        try { res.sendRedirect(redirect); }
//        catch (Exception ignored) {}
//    }
//}
//
