package com.example.faishion.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    // 로컬 회원가입용
    public record RegisterLocalReq(
            @NotBlank String username,       // 로그인 ID
            @Email @NotBlank String email,
            @NotBlank @Size(min=8, max=64) String password,
            @NotBlank String name,
            @NotBlank String phoneNumber
    ) {}

    // 로그인: username 또는 email 아무거나 허용 (필드 1개로 통일)
    public record LoginReq(
            @NotBlank String login,    // username 또는 email 입력
            @NotBlank String password
    ) {}

    public record TokenRes(String accessToken, String refreshToken) {}
}

