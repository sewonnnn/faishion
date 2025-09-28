package com.example.faishion.admin;

import com.example.faishion.security.JwtTokenProvider;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class AdminAuthController {

    private final AdminService adminService;
    private final JwtTokenProvider jwt;

    public AdminAuthController(AdminService adminService, JwtTokenProvider jwt) {
        this.adminService = adminService;
        this.jwt = jwt;
    }

    @PostMapping("/auth/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Map<String, String> dto) {
        String id = dto.get("id");
        String password = dto.get("password");

        Admin admin = adminService.loginAdmin(id, password);

        // 관리자 전용 JWT 발급
        String accessToken = jwt.generateAccess(admin.getId(), List.of("ROLE_ADMIN"));
        String refreshToken = jwt.generateRefresh(admin.getId(), List.of("ROLE_ADMIN"));

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .path("/")
                .maxAge(1209600)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("accessToken", accessToken, "adminId", admin.getId()));
    }
}
