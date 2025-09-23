package com.example.faishion.web;

import com.example.faishion.security.JwtTokenProvider;
import com.example.faishion.user.AuthProvider;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import com.example.faishion.web.dto.AuthDto;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {
  //  @Value("${spring.security.oauth2.client.registration.naver.client-id}")
  //  private String naverClientId;
   // @Value("${spring.security.oauth2.client.registration.naver.client-secret}")
  //  private String naverClientSecret;


    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;


    // 로컬 회원가입
    @Transactional
    public void registerLocal(AuthDto.RegisterLocalReq req) {
        if (userRepo.existsByUsername(req.username())) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        if (userRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        User u = new User();
        u.setId(UUID.randomUUID().toString());
        u.setProvider(AuthProvider.LOCAL);
        u.setUsername(req.username());
        u.setEmail(req.email());
        u.setPwHash(encoder.encode(req.password())); // 비밀번호 암호화
        u.setName(req.name());
        u.setPhoneNumber(req.phoneNumber());

        userRepo.save(u);
    }

    // 로컬 로그인
    public User loginLocal(String login, String password) {
        var userOpt = (login.contains("@"))
                ? userRepo.findByEmail(login)
                : userRepo.findByUsername(login);
        var u = userOpt.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (u.getPwHash() == null || !encoder.matches(password, u.getPwHash())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }
        return u;
    }


    // 네이버 로그인
    public User loginNaver(String code, String state) {
        RestTemplate rt = new RestTemplate();

        // 1. 액세스 토큰 요청
        String tokenUrl = "https://nid.naver.com/oauth2.0/token" +
                "?grant_type=authorization_code" +
                "&client_id=" + System.getenv("NAVER_CLIENT_ID") +
                "&client_secret=" + System.getenv("NAVER_CLIENT_SECRET") +
                "&code=" + code +
                "&state=" + state;

        Map tokenRes = rt.getForObject(tokenUrl, Map.class);
        String accessToken = (String) tokenRes.get("access_token");

        // 2. 사용자 정보 요청
        var headers = new org.springframework.http.HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        var entity = new org.springframework.http.HttpEntity<>(headers);

        var profileRes = rt.exchange(
                "https://openapi.naver.com/v1/nid/me",
                org.springframework.http.HttpMethod.GET,
                entity,
                Map.class
        );

        Map resp = (Map) profileRes.getBody().get("response");
        String email = (String) resp.get("email");
        String id = (String) resp.get("id");
        String name = (String) resp.get("name");
        String mobile = (String) resp.get("mobile");

        // 3. DB에 사용자 존재 여부 확인
        return userRepo.findByProviderAndProviderUserId(AuthProvider.NAVER, id)
                .orElseGet(() -> {
                    User u = new User();
                    u.setId(UUID.randomUUID().toString());
                    u.setProvider(AuthProvider.NAVER);
                    u.setProviderUserId(id);
                    u.setEmail(email);
                    u.setName(name);
                    u.setPhoneNumber(mobile);
                    return userRepo.save(u);
                });
    }


    // 카카오 로그인
    public User loginKakao(String code) {
        RestTemplate rt = new RestTemplate();

        // 1. 액세스 토큰 요청
        String tokenUrl = "https://kauth.kakao.com/oauth/token" +
                "?grant_type=authorization_code" +
                "&client_id=" + System.getenv("KAKAO_CLIENT_ID") +
                "&redirect_uri=http://localhost:5173/oauthcallback" +
                "&code=" + code;

        Map tokenRes = rt.postForObject(tokenUrl, null, Map.class);
        String accessToken = (String) tokenRes.get("access_token");

        // 2. 사용자 정보 요청
        var headers = new org.springframework.http.HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        var entity = new org.springframework.http.HttpEntity<>(headers);

        var profileRes = rt.exchange(
                "https://kapi.kakao.com/v2/user/me",
                org.springframework.http.HttpMethod.GET,
                entity,
                Map.class
        );

        Map resp = profileRes.getBody();
        String id = String.valueOf(resp.get("id"));

        Map kakaoAccount = (Map) resp.get("kakao_account");
        String email = (String) kakaoAccount.get("email");
        Map profile = (Map) kakaoAccount.get("profile");
        String nickname = (String) profile.get("nickname");

        // 3. DB에 사용자 존재 여부 확인
        return userRepo.findByProviderAndProviderUserId(AuthProvider.KAKAO, id)
                .orElseGet(() -> {
                    User u = new User();
                    u.setId(UUID.randomUUID().toString());
                    u.setProvider(AuthProvider.KAKAO);
                    u.setProviderUserId(id);
                    u.setEmail(email);
                    u.setName(nickname);
                    u.setPhoneNumber("kakao");
                    return userRepo.save(u);
                });
    }


    // JWT 발급
    public Map<String, String> issueTokens(User u) {
        String access = jwt.generateAccess(u.getId(), List.of("ROLE_USER"));
        String refresh = jwt.generateRefresh(u.getId());
        return Map.of("access", access, "refresh", refresh);
    }

    // 테스트 로그 출력용
    @Value("${spring.datasource.url}")
    private String dbUrl;

    @PostConstruct
    public void logDbUrl() {
        System.out.println(">>> [AuthService] DB URL = " + dbUrl);
    }
}
