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

    @NotBlank
    @Pattern(
            regexp = "^010-\\d{4}-\\d{4}$",
            message = "전화번호는 010-0000-0000 형식으로 입력해야 합니다."
    )
    private String phoneNumber;

    @NotBlank(message = "상호명은 필수 입력값입니다.")
    private String businessName;

    @NotBlank(message = "사업자 등록번호는 필수 입력값입니다.")
    @Pattern(
            regexp = "^\\d{3}-\\d{2}-\\d{5}$",
            message = "사업자 등록번호는 123-45-67890 형식으로 입력해야 합니다."
    )
    private String businessNumber;

    @NotBlank(message = "대표자 이름은 필수 입력값입니다.")
    private String ownerName;
}