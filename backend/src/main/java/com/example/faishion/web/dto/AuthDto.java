package com.example.faishion.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDto {

    // 로컬 회원가입 DTO
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterLocalReq {
        @NotBlank
        private String id;   // 사용자가 직접 입력할 아이디 (PK)

        @Email
        @NotBlank
        private String email;

        @NotBlank
        @Size(min = 8, max = 64)
        private String password;

        @NotBlank
        private String name;

        @NotBlank
        @Pattern(
                regexp = "^010-\\d{4}-\\d{4}$",
                message = "전화번호는 010-0000-0000 형식으로 입력해야 합니다."
        )
        private String phoneNumber;
    }

    // 로그인 DTO (id 또는 email 입력 허용)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginReq {
        @NotBlank
        private String id; // ID로만 로그인 가능

        @NotBlank
        private String password;
    }

    // 토큰 응답 DTO
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TokenRes {
        private String accessToken;
        private String refreshToken;
    }
}
