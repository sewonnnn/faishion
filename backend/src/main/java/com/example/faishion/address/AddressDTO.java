package com.example.faishion.address;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressDTO {
    @NotBlank
    private String zipcode;

    @NotBlank
    private String street;

    @NotBlank
    private String detail;

//    @NotBlank
//    private String requestMsg ;

    private Boolean isDefault; // null이면 false 처리
}
