package com.example.faishion.user;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    // 수정
    private String id;       // 사용자가 입력한 아이디(로컬) or 소셜 ID
    private String password; // 로컬만
    private String email;
    private String name;
    private String phoneNumber;

}
