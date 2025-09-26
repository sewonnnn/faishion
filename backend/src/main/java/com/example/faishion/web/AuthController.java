package com.example.faishion.web;

import com.example.faishion.admin.Admin;
import com.example.faishion.admin.AdminRepository;
import com.example.faishion.security.JwtTokenProvider;
import com.example.faishion.seller.Seller;
import com.example.faishion.seller.SellerDTO;
import com.example.faishion.seller.SellerRepository;
import com.example.faishion.seller.SellerService;
import com.example.faishion.user.AuthProvider;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import com.example.faishion.web.dto.AuthDto;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    // 로컬 + 소셜 jwt 발급 API
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;
    private final AuthService authService;
    private final SellerService sellerService;
    private final SellerRepository sellerRepo;
    private final AdminRepository adminRepo;


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
    public ResponseEntity<String> login(@Valid @RequestBody AuthDto.LoginReq req, HttpServletResponse response) {
            User u = authService.loginLocal(req.getId(), req.getPassword()); // id 기반 로그인
            return token(req.getId(), "USER");
    }

    // 판매자 회원가입
    @PostMapping("/seller/register")
    public ResponseEntity<?> register(@RequestBody SellerDTO dto) {
        try {
            Seller seller = sellerService.registerSeller(dto);
            return ResponseEntity.ok("판매자 회원가입 성공: " + seller.getEmail());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/seller/login")
    public ResponseEntity<?> sellerLogin(@RequestBody SellerDTO dto) {
        Seller seller = sellerService.loginSeller(dto.getId(), dto.getPassword());
        return token(seller.getId(), "SELLER");
    }

    @Value("${spring.security.oauth2.client.registration.naver.client-id}")
    private String clientId;
    @Value("${spring.security.oauth2.client.registration.naver.client-secret}")
    private String clientSecret;

    // 네이버 로그인
    @PostMapping("/login/naver")
    public ResponseEntity<?> loginNaver(@RequestBody Map<String, String> body, HttpServletResponse response) {
        RestTemplate restTemplate = new RestTemplate();
//        String clientId = "UbIrUTt9yAJ42TARcJC5";//위에 @Value 어노테이션으로 받아오도록 수정
//        String clientSecret = "WbnCi4gU7B";//시크릿 키니까 위에 @Value 어노테이션으로 받아오도록 수정
        try {
            // 1. 액세스 토큰(Access Token) 요청
            String tokenUrl = UriComponentsBuilder.fromHttpUrl("https://nid.naver.com/oauth2.0/token")
                    .queryParam("grant_type", "authorization_code")
                    .queryParam("client_id", clientId) // @Value 주입
                    .queryParam("client_secret", clientSecret) // @Value 주입
                    .queryParam("code", body.get("code"))
                    .queryParam("state", body.get("state"))
                    .queryParam("redirect_uri", "http://localhost:5173/oauthcallback/naver") //  추가
                    .toUriString();

            // JSON 응답을 Map으로 바로 받음
            ResponseEntity<Map> tokenResponse = restTemplate.getForEntity(tokenUrl, Map.class);
            Map<String, Object> tokenBody = tokenResponse.getBody();
            System.out.println("네이버 토큰 응답: " + tokenBody);
            String accessToken = (String) tokenBody.get("access_token");

            // 2. 받은 액세스 토큰으로 네이버 프로필 정보 조회 요청
            String profileUrl = "https://openapi.naver.com/v1/nid/me";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> profileResponse = restTemplate.exchange(
                    profileUrl,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> profileBody = profileResponse.getBody();
            Map<String, Object> profileData = (Map<String, Object>) profileBody.get("response");

            System.out.println("네이버 프로필 데이터 " +  profileData);
            String naverUserId = (String) profileData.get("id");
            // 네이버 프로필에서 여기서 꺼내져서 user에 넣으면 됨
            String naverUserEmail = (String) profileData.get("email");
            String naverUserName = (String) profileData.get("name");
            String naverUserMobile = (String) profileData.get("mobile");


            // 3. User 저장 or 기존 유저 조회
            User u = authService.saveOrUpdateNaverUser(naverUserId, naverUserEmail, naverUserName, naverUserMobile);

            // 4. JWT 발급
            var tokens = authService.issueTokens(u);

            // 5. RefreshToken → ResponseCookie로 만들어 헤더에 담음
            ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokens.get("refresh"))
                    .httpOnly(true)
                    //.secure(true)   // HTTPS 환경에서만 사용, dev 환경이면 주석 처리
                    .path("/")
                    .maxAge(1209600) // 14일
                    .build();

            // 6. AccessToken은 JSON body로 내려줌
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(Map.of(
                            "accessToken", tokens.get("access"),
                            "userId", u.getId(),
                            "email", u.getEmail(),
                            "name", u.getName()
                    ));

        } catch (Exception e) {
            System.err.println("네이버 로그인 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("네이버 로그인 실패");
        }

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

    @PostMapping("/temp/token")
    public ResponseEntity<String> tempLogin(@RequestBody Map<String, String> req){
        String id = "temp";
        String role = req.get("role");
        switch (role){
            case "USER":
                User user = userRepo.findById(id).orElse(null);
                if (user == null) {
                    user = new User();
                    user.setId(id);
                    user.setProvider(AuthProvider.LOCAL);
                    user.setName("유부미");
                    user.setEmail("boomi@naver.com");
                    user.setPhoneNumber("010-1234-5678");
                    userRepo.save(user);
                }
                break;
            case "SELLER":
                Seller seller = sellerRepo.findById(id).orElse(null);
                if (seller == null) {
                    seller = new Seller();
                    seller.setId(id);
                    seller.setOwnerName("이현호");
                    seller.setBusinessName("페이션");
                    seller.setBusinessNumber("1234567890");
                    seller.setPhoneNumber("010-1234-5678");
                    seller.setEmail("hyunho@naver.com");
                    sellerRepo.save(seller);
                }
                break;
            case "ADMIN":
                Admin admin = adminRepo.findById(id).orElse(null);
                if(admin == null){
                    admin = new Admin();
                    admin.setId(id);
                    admin.setName("박세원");
                    adminRepo.save(admin);
                }
                break;
        }
        return token(id, role);
    }

    private ResponseEntity<String> token(String id, String role){
        String accessToken = jwt.generateAccess(id, List.of(role));
        // 리프레시 토큰 생성
        String refreshToken = jwt.generateRefresh(id, List.of(role));
        // 리프레시 토큰을 HttpOnly 쿠키로 설정
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                //.secure(true) // HTTPS 환경에서만 전송, 개발환경이 HTTP이므로 임시 주석처리
                .path("/")
                .maxAge(86400)
                .build();
        // 액세스 토큰은 JSON 응답으로, 리프레시 토큰은 쿠키 헤더에 담아 전송
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(accessToken);
    }


}
