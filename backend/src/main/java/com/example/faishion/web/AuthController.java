package com.example.faishion.web;

import com.example.faishion.security.JwtTokenProvider;
import com.example.faishion.user.AuthProvider;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import com.example.faishion.web.dto.AuthDto;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    // 로컬 + 소셜 jwt 발급 API
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;
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

    // 로컬 로그인: username 또는 email 둘 다 허용
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginReq req, HttpServletResponse response) {
        try {
            User u = authService.loginLocal(req.login(), req.password());
            var tokens = authService.issueTokens(u);

            Cookie accessCookie = new Cookie("accessToken", tokens.get("access"));
            accessCookie.setHttpOnly(true);
            accessCookie.setPath("/");
            accessCookie.setMaxAge(3600);
            response.addCookie(accessCookie);

            Cookie refreshCookie = new Cookie("refreshToken", tokens.get("refresh"));
            refreshCookie.setHttpOnly(true);
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(1209600);
            response.addCookie(refreshCookie);

            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // 네이버 로그인
    @PostMapping("/login/naver")
    public ResponseEntity<?> loginNaver(@RequestBody Map<String, String> body, HttpServletResponse response) {
        User u = authService.loginNaver(body.get("code"), body.get("state"));
        var tokens = authService.issueTokens(u);

        Cookie accessCookie = new Cookie("accessToken", tokens.get("access"));
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(3600);
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", tokens.get("refresh"));
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(1209600);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok().build();
    }

    // 카카오 로그인
    @PostMapping("/login/kakao")
    public ResponseEntity<?> loginKakao(@RequestBody Map<String, String> body, HttpServletResponse response) {
        User u = authService.loginKakao(body.get("code"));
        var tokens = authService.issueTokens(u);

        Cookie accessCookie = new Cookie("accessToken", tokens.get("access"));
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(3600);
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", tokens.get("refresh"));
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(1209600);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok().build();
    }


}