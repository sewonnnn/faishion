package com.example.faishion.seller;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerDTO {

    @NotBlank
    @Size(min = 6, max = 20, message = "아이디는 최소 6자 이상 20자 이하로 입력해야 합니다.")
    private String id;  // 사용자 입력 아이디 (PK)

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 8, max = 64, message = "비밀번호는 최소 8자 이상 64자 이하로 입력해야 합니다.")
    private String password;

    @NotBlank
    @Pattern(
            regexp = "^010-\\d{4}-\\d{4}$",
            message = "전화번호는 010-0000-0000 형식으로 입력해야 합니다."
    )
    private String phoneNumber;

    @NotBlank
    private String businessName;

    @NotBlank
    private String businessNumber;

    @NotBlank
    private String ownerName;
}