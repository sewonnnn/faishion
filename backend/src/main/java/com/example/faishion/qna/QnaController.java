package com.example.faishion.qna;

import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/qna")
public class QnaController {

    private final QnaService qnaService;
    private final UserRepository userRepository;
    
    // 게시물 리스트 출력
    @GetMapping("/list")
    List<QnaDTO> findAllQnaList() {
        System.out.println("컨트롤러 지나옴");
        User user1 = new User();
        user1.setId("test-user");
        user1.setName("에이");
        user1.setEmail("aaa@naver.com");
        user1.setPhoneNumber("01012345678");

        User savedUser = userRepository.save(user1);

        List<QnaDTO> qnaList = new ArrayList<>();
        qnaList.add(new QnaDTO(1, savedUser, "제목", "내용"));
        return qnaList;
    }
}

