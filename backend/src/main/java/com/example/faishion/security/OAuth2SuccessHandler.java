package com.example.faishion.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    // JwtTokenProvider 주입
    private final JwtTokenProvider jwt;

    // React 콜백 페이지
    // 토큰을 URL에 담지 않으므로, 더이상 query param이 필요 없습니다.
    private static final String FRONT_SUCCESS_URL = "http://localhost:5173/login/success";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();

        // CustomOAuth2UserService에서 심어둔 내부 UUID
        String appUserId = (String) principal.getAttributes().get("app_user_id");
        if (appUserId == null || appUserId.isBlank()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing app_user_id");
            return;
        }

        // 👇️ 소셜 로그인 성공 직후 JWT를 생성
        String accessToken  = jwt.generateAccess(appUserId, List.of("ROLE_USER"));
        String refreshToken = jwt.generateRefresh(appUserId);

        // 👇️ 생성된 JWT를 HttpOnly 쿠키에 담아 응답
        Cookie accessCookie = new Cookie("accessToken", accessToken);
        accessCookie.setHttpOnly(true);
        // accessCookie.setSecure(true); // HTTPS 환경에서는 활성화
        accessCookie.setPath("/");
        accessCookie.setMaxAge(3600); // 1시간
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        // refreshCookie.setSecure(true); // HTTPS 환경에서는 활성화
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(86400); // 24시간
        response.addCookie(refreshCookie);

        // 👇️ 토큰 없이 성공 페이지로 리디렉션
        response.sendRedirect(FRONT_SUCCESS_URL);
    }
}