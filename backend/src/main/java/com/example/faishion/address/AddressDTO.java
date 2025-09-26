package com.example.faishion.address;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor; // ⭐ 추가
import lombok.Getter;
import lombok.NoArgsConstructor; // ⭐ 추가
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor // ⭐ 기본 생성자 추가
@AllArgsConstructor // ⭐ 모든 필드를 포함하는 생성자 추가
public class AddressDTO {

    private Long id;

    @NotBlank(message = "우편번호는 필수입니다.") // 메시지 추가
    private String zipcode;

    @NotBlank(message = "도로명 주소는 필수입니다.") // 메시지 추가
    private String street;

    @NotBlank(message = "상세 주소는 필수입니다.") // 메시지 추가
    private String detail;
    private Boolean isDefault;
    private String requestMsg;
}