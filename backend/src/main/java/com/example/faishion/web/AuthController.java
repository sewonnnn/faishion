package com.example.faishion.web;

import com.example.faishion.user.User;
import com.example.faishion.web.dto.AuthDto;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 로컬 회원가입
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterLocalReq req) {
        try {
            authService.registerLocal(req);
            return ResponseEntity.ok("회원가입 성공");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 로컬 로그인: id 또는 email 허용
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginReq req, HttpServletResponse response) {
        try {
            User u = authService.loginLocal(req.getId(), req.getPassword()); // id 기반 로그인
            var tokens = authService.issueTokens(u);

            Cookie refreshCookie = new Cookie("refreshToken", tokens.get("refresh"));
            refreshCookie.setHttpOnly(true);
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(1209600); // 2주
            response.addCookie(refreshCookie);

            return ResponseEntity.ok(new AuthDto.TokenRes(tokens.get("access"), tokens.get("refresh")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }


    // 네이버 로그인
    @PostMapping("/login/naver")
    public ResponseEntity<?> loginNaver(@RequestBody Map<String, String> body, HttpServletResponse response) {
        User u = authService.loginNaver(body.get("code"), body.get("state"));
        var tokens = authService.issueTokens(u);

        setCookies(response, tokens);
        return ResponseEntity.ok(new AuthDto.TokenRes(tokens.get("access"), tokens.get("refresh")));
    }

    // 카카오 로그인
    @PostMapping("/login/kakao")
    public ResponseEntity<?> loginKakao(@RequestBody Map<String, String> body, HttpServletResponse response) {
        User u = authService.loginKakao(body.get("code"));
        var tokens = authService.issueTokens(u);

        setCookies(response, tokens);
        return ResponseEntity.ok(new AuthDto.TokenRes(tokens.get("access"), tokens.get("refresh")));
    }

    // 공통 쿠키 저장 메소드
    private void setCookies(HttpServletResponse response, Map<String, String> tokens) {
        Cookie accessCookie = new Cookie("accessToken", tokens.get("access"));
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(3600); // 1시간
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", tokens.get("refresh"));
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(1209600); // 14일
        response.addCookie(refreshCookie);
    }
}
