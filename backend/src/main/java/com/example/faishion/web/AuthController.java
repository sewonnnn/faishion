package com.example.faishion.web;

import com.example.faishion.admin.Admin;
import com.example.faishion.admin.AdminRepository;
import com.example.faishion.admin.AdminService;
import com.example.faishion.security.JwtTokenProvider;
import com.example.faishion.seller.Seller;
import com.example.faishion.seller.SellerDTO;
import com.example.faishion.seller.SellerRepository;
import com.example.faishion.seller.SellerService;
import com.example.faishion.user.AuthProvider;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import com.example.faishion.web.dto.AuthDto;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final SellerService sellerService;
    private final JwtTokenProvider jwt;
    private final AdminService adminService;

    // 로컬 회원가입
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterLocalReq req) {
        authService.registerLocal(req);
        return ResponseEntity.ok("회원가입 성공");
    }

    // 로컬 로그인
    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody AuthDto.LoginReq req, HttpServletResponse response) {
        User u = authService.loginLocal(req.getLoginId(), req.getPassword()); //수정
        return token(u.getId(), "USER");
    }

    //추가
    // 아이디 중복검사
    @PostMapping("/check-id")
    public ResponseEntity<?> checkId(@RequestBody Map<String, String> body) {
        String id = body.get("id");
        boolean available = authService.checkId(id);

        if (available) {
            return ResponseEntity.ok("사용 가능한 아이디입니다.");
        } else {
            return ResponseEntity.badRequest().body("이미 사용 중인 아이디입니다.");
        }
    }

    // 이메일 중복검사
    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        boolean available = authService.checkEmail(email);

        if (available) {
            return ResponseEntity.ok("사용 가능한 이메일입니다.");
        } else {
            return ResponseEntity.badRequest().body("이미 사용 중인 이메일입니다.");
        }
    }

    // 판매자 회원가입
    @PostMapping("/seller/register")
    public ResponseEntity<?> registerSeller(@RequestBody SellerDTO dto) {
        Seller seller = sellerService.registerSeller(dto);
        return ResponseEntity.ok("판매자 회원가입 성공: " + seller.getEmail());
    }

    // 판매자 로그인
    @PostMapping("/seller/login")
    public ResponseEntity<?> loginSeller(@RequestBody SellerDTO dto) {
        Seller seller = sellerService.loginSeller(dto.getId(), dto.getPassword());
        String accessToken = jwt.generateAccess(seller.getId(), List.of("SELLER"));
        String refreshToken = jwt.generateRefresh(seller.getId(), List.of("SELLER"));

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .path("/")
                .maxAge(1209600)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("accessToken", accessToken));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> dto) {
        System.out.println("로그인 시도");
        String id = dto.get("id");
        String password = dto.get("password");
        System.out.println(id + ", " + password);

        Admin admin = adminService.loginAdmin(id, password);

        return token(admin.getId(), "ADMIN");
    }

    // 네이버 로그인
    @Value("${spring.security.oauth2.client.registration.naver.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.naver.client-secret}")
    private String clientSecret;

    @PostMapping("/login/naver")
    public ResponseEntity<?> loginNaver(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String state = body.get("state");

        RestTemplate rt = new RestTemplate();

        // 1. 토큰 요청
        String tokenUrl = "https://nid.naver.com/oauth2.0/token" +
                "?grant_type=authorization_code" +
                "&client_id=" + clientId +
                "&client_secret=" + clientSecret +
                "&code=" + code +
                "&state=" + state;

        Map tokenRes = rt.getForObject(tokenUrl, Map.class);
        String accessToken = (String) tokenRes.get("access_token");

        // 2. 프로필 조회
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> profileRes = rt.exchange(
                "https://openapi.naver.com/v1/nid/me",
                HttpMethod.GET,
                entity,
                Map.class
        );

        Map resp = (Map) profileRes.getBody().get("response");
        String naverUserId = (String) resp.get("id");
        String email = (String) resp.get("email");
        String name = (String) resp.get("name");
        String mobile = (String) resp.get("mobile");

        // 3. DB 저장 or 조회
        User u = authService.saveOrUpdateNaverUser(naverUserId, email, name, mobile);

        // 4. JWT 발급
        Map<String, String> tokens = authService.issueTokens(u);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", tokens.get("refresh"))
                .httpOnly(true)
                .path("/")
                .maxAge(1209600)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of(
                        "accessToken", tokens.get("access"),
                        "userId", u.getId(),
                        "email", u.getEmail(),
                        "name", u.getName()
                ));

    }

    /*
    // 임시 토큰 발급
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

     */

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
