package com.example.faishion.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDto {

    // 수정
    // 로컬 회원가입 DTO
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterLocalReq {
        @NotBlank(message = "아이디는 필수 입력값입니다.")
        @Pattern(
                regexp = "^[a-z0-9]{8,16}$",
                message = "아이디는 영소문자와 숫자 조합, 8~16자여야 합니다."
        )
        private String id;

        @NotBlank(message = "이메일은 필수 입력값입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        private String email;


        @NotBlank(message = "비밀번호는 필수 입력값입니다.")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,16}$",
                message = "비밀번호는 영소문자, 숫자, 특수문자를 최소 1개 이상 포함한 8~16자여야 합니다."
        )
        private String password;

        @NotBlank(message = "이름은 필수 입력값입니다.")
        @Size(max = 20, message = "이름은 최대 20자까지 가능합니다.")
        private String name;

        @NotBlank(message = "전화번호는 필수 입력값입니다.")
        @Pattern(
                regexp = "^010-\\d{4}-\\d{4}$",
                message = "전화번호는 010-0000-0000 형식이어야 합니다."
        )
        private String phoneNumber;
    }

    // 로그인 DTO (id 또는 email 입력 허용)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginReq {
        @NotBlank
        private String loginId; // 수정

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
