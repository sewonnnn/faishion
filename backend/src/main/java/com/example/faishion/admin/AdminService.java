package com.example.faishion.admin;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;
    private final PasswordEncoder encoder;

    // 앱 실행 시 기본 관리자 계정 생성
    @PostConstruct
    public void initAdmin() {
        if (!adminRepository.existsById("admin")) {
            Admin admin = new Admin();
            admin.setId("admin");
            admin.setName("슈퍼관리자");
            admin.setPwHash(encoder.encode("admin1234")); // 기본 비번
            adminRepository.save(admin);
            log.info("기본 관리자 계정 생성 완료: id=admin");
        }
    }

    // 로그인
    public Admin loginAdmin(String id, String password) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 관리자입니다."));
        if (!encoder.matches(password, admin.getPwHash())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }
        return admin;
    }
}
