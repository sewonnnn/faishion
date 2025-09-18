package com.example.faishion.web;

import com.example.faishion.security.JwtTokenProvider;
import com.example.faishion.user.AuthProvider;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import com.example.faishion.web.dto.AuthDto;
import com.example.faishion.web.dto.AuthDto.*;
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

    // 로컬 회원가입
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterLocalReq req) {
        if (userRepo.existsByUsername(req.username()))
            return ResponseEntity.badRequest().body("이미 존재하는 아이디입니다.");
        if (userRepo.existsByEmail(req.email()))
            return ResponseEntity.badRequest().body("이미 존재하는 이메일입니다.");

        User u = new User();
        u.setId(UUID.randomUUID().toString());
        u.setProvider(AuthProvider.LOCAL);
        u.setProviderUserId(null);
        u.setUsername(req.username());
        u.setEmail(req.email());
        u.setPwHash(encoder.encode(req.password()));
        u.setName(req.name());
        u.setPhoneNumber(req.phoneNumber());

        userRepo.save(u);
        return ResponseEntity.ok().build();
    }

    // 로컬 로그인: username 또는 email 둘 다 허용
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginReq req) {
        var login = req.login();
        var userOpt = (login.contains("@"))
                ? userRepo.findByEmail(login)
                : userRepo.findByUsername(login);
        var u = userOpt.orElse(null);

        if (u == null || u.getPwHash() == null || !encoder.matches(req.password(), u.getPwHash())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        String access  = jwt.generateAccess(u.getId(), List.of("ROLE_USER"));
        String refresh = jwt.generateRefresh(u.getId());
        return ResponseEntity.ok(new AuthDto.TokenRes(access, refresh));
    }

    // 소셜 로그인 이후 React에서 JWT 요청
    @PostMapping("/social/callback")
    public ResponseEntity<?> socialCallback(@RequestBody Map<String,String> body) {
        String appUserId = body.get("userId"); // React에서 전달한 UUID
        var u = userRepo.findById(appUserId).orElseThrow();

        String access  = jwt.generateAccess(u.getId(), List.of("ROLE_USER"));
        String refresh = jwt.generateRefresh(u.getId());
        return ResponseEntity.ok(new AuthDto.TokenRes(access, refresh));
    }
}