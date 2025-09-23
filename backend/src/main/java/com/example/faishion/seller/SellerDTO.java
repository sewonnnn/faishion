package com.example.faishion.seller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerDTO {
    private String id;
    private String email;
    private String phoneNumber;
    private String password;
    private String businessName;
    private String businessNumber;
    private String ownerName;
}