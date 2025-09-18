package com.example.faishion.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDto {
    public record RegisterReq(
            @NotBlank String userId,
            @Email String email,
            @NotBlank String password,
            @NotBlank String name,
            @NotBlank String phoneNumber
            // User entitiy : phoneNumber ( nullable=false )
            // dto에 userId 가 있는데 , 로그인은 email+password 로 하니까 혼선을 줄수있음
    ) {}
    public record LoginReq( @NotBlank String userId,@Email String email, @NotBlank String password) {}
    public record TokenRes(String accessToken, String refreshToken) {}
}

