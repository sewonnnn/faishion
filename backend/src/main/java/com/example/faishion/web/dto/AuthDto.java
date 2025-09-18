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
    ) {}
    public record LoginReq( @NotBlank String userId,@Email String email, @NotBlank String password) {}
    public record TokenRes(String accessToken, String refreshToken) {}
}
