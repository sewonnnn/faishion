package com.example.faishion.user;

import com.example.faishion.image.Image;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {
    private String id;
    private String name;
    private String email;
    private String phoneNumber;
    private String password;
    private Image image;
    private int height;
    private int weight;

    // 주소 관련 필드 추가
    private String zipcode;
    private String street;
    private String detail;

    // 편의를 위한 생성자 추가
    public UserUpdateDTO(String id, String name, String email, String phoneNumber, Image image, int height, int weight, String zipcode, String street, String detail) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.image = image;
        this.height = height;
        this.weight = weight;
        this.zipcode = zipcode;
        this.street = street;
        this.detail = detail;
    }
}