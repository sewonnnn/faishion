package com.example.faishion.join;

import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
public class JoinService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public JoinService(UserRepository userRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    public void joinProcess(@RequestBody JoinDTO joinDTO) {
        String userId = joinDTO.getUserId();
        String password = joinDTO.getPassword();

        Boolean isExist = userRepository.existsById(userId);

        if (isExist) {
            return;
        }
        User user = new User();

        user.getId(user);
        user.getPwHash(password);

        userRepository.save(user);
    }

}
