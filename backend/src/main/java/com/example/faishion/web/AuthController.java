package com.example.faishion.web;

import com.example.faishion.security.JwtTokenProvider;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import com.example.faishion.web.dto.AuthDto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterReq req) {
        if (userRepo.findByEmail(req.email()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        var user = new User();
        user.setId(UUID.randomUUID().toString());   // PK(String) 생성
        user.setProvider("local");
        user.setName(req.name());
        user.setEmail(req.email());
        user.setPhoneNumber(req.phoneNumber());
        user.setPwHash(encoder.encode(req.password())); // 비밀번호 해시

        userRepo.save(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginReq req) {
        var u = userRepo.findByEmail(req.email()).orElse(null);
        if (u == null || u.getPwHash() == null || !encoder.matches(req.password(), u.getPwHash())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        // 접근 및 재발급 토큰 생성
        var access = jwt.generateAccess(u.getEmail(), java.util.List.of("ROLE_USER"));
        var refresh = jwt.generateRefresh(u.getEmail());
        return ResponseEntity.ok(new TokenRes(access, refresh));
    }
}
