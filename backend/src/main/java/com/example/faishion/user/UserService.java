package com.example.faishion.user;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 자체 로그인 : 회원가입(존재여부) 메소드
    @Transactional
    // 이메일 중복 체크
    public Boolean existsByEmail(UserDTO userDTO) {
        return userRepository.existsByEmail(userDTO.getEmail());
    }

    // 자체 로그인 : 회원가입
    @Transactional
    public String addUser(UserDTO dto) {
        if(userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 사용자입니다.");
        }

        User user = new User();
        user.setId(dto.getId()); // 사용자 입력 아이디
        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setProvider(AuthProvider.LOCAL);
        user.setPwHash(passwordEncoder.encode(dto.getPassword()));

        return userRepository.save(user).getId();
    }


}
