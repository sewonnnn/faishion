package com.example.faishion.user;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
            //(readOnly = true)
    public Boolean existsByEmail(UserDTO userDTO) {
        return userRepository.existsByEmail(userDTO.getEmail());
    }

    // 자체 로그인 : 회원가입
    @Transactional
    //Long 타입 , 래퍼클래스로 쓰려고 했는데 d
    public String addUser(UserDTO dto) {

        if(userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 사용자입니다.");
        }

        User user = new User();
       /* User user = User.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .isLock(false)
                .isSocial(false)
//                .roleType(UserRoleType.USER) // 우선 일반 유저로 가입
//                .nickname(dto.getNickname())
                .email(dto.getEmail())
                .build();*/

        return userRepository.save(user).getId();
    }

    // 자체 로그인

//    // 자체 로그인 회원 정보 수정
//    @Transactional
//    public String updateUser(UserDTO dto) throws AccessDeniedException {
//
//        // 본인만 수정 가능 검증
//        String sessionUsername = SecurityContextHolder.getContext().getAuthentication().getName();
//        if (!sessionUsername.equals(dto.getUsername())) {
//            throw new AccessDeniedException("본인 계정만 수정 가능");
//        }
//
//        // 조회
//        User entity = userRepository.findByUsernameAndIsLockAndIsSocial(dto.getUsername())
//                .orElseThrow(() -> new UsernameNotFoundException(dto.getUsername()));
//
//        // 회원 정보 수정
//        entity.updateUser(dto);
//
//        return userRepository.save(entity).getId();
//    }

    // 자체/소졀 로그인 회원 탈퇴

    // 소셜 로그인 ( 매 로그인시 : 신규=가입, 기존 = 업데이트 ..?)

    // 자체/소셜 유저 정보 조회
}
