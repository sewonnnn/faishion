package com.example.faishion.seller;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SellerListDTO {
    private String id;
    private String email; //판매자 이메일
    private String phoneNumber; //판매자 휴대폰번호
    private String businessName; //상호명
    private String businessNumber; //사업자번호
    private String ownerName; //대표이름
    private LocalDateTime createdAt;
}
