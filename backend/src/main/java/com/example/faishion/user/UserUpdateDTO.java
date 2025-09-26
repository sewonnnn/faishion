package com.example.faishion.user;

import com.example.faishion.address.Address;
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
    private Address address;

    // 편의를 위한 생성자 추가
    public UserUpdateDTO(String id, String name, String email, String phoneNumber, Image image, int height, int weight, Address address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.image = image;
        this.height = height;
        this.weight = weight;
        this.address = address;
    }
}