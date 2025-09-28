package com.example.faishion.web;

import com.example.faishion.security.JwtTokenProvider;
import com.example.faishion.user.AuthProvider;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import com.example.faishion.web.dto.AuthDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;

    // 로컬 회원가입
    @Transactional
    public void registerLocal(AuthDto.RegisterLocalReq req) {
        if (userRepo.existsById(req.getId())) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        User u = User.createLocal(
                req.getId(),
                req.getEmail(),
                encoder.encode(req.getPassword()),
                req.getName(),
                req.getPhoneNumber()
        );
        userRepo.save(u);
    }

    // 로컬 로그인
    public User loginLocal(String loginId, String password) {
        User u = userRepo.findByLoginId(loginId)   //수정
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        if (u.getPwHash() == null || !encoder.matches(password, u.getPwHash())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }
        return u;
    }


    // 네이버 소셜 로그인 (DB 저장/조회)
    @Transactional
    public User saveOrUpdateNaverUser(String naverUserId, String email, String name, String mobile) {
        return userRepo.findByProviderAndProviderUserId(AuthProvider.NAVER, naverUserId)
                .orElseGet(() -> {
                    User u = new User();
                    u.setId("NAVER_" + naverUserId);
                    u.setProvider(AuthProvider.NAVER);
                    u.setProviderUserId(naverUserId);
                    u.setEmail(email != null ? email : "no-email@naver.com");
                    u.setName(name != null ? name : "네이버사용자");
                    u.setPhoneNumber(mobile != null ? mobile : "010-0000-0000");
                    return userRepo.save(u);
                });
    }


    // JWT 발급
    public Map<String, String> issueTokens(User u) {
        String access = jwt.generateAccess(u.getId(), List.of("ROLE_USER"));
        String refresh = jwt.generateRefresh(u.getId());
        return Map.of("access", access, "refresh", refresh);
    }
}
