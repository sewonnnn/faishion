package com.example.faishion.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    // React 콜백 페이지
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

        // 토큰은 보내지 않고 userId만 React로 넘김
        String redirect = UriComponentsBuilder.fromUriString(FRONT_SUCCESS_URL)
                .queryParam("userId", appUserId)
                .build().toUriString();

        response.sendRedirect(redirect);
    }
}
