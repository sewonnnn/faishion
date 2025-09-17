package com.example.faishion.qna;

import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/qna")
public class QnaController {
    private final QnaService qnaService;

    // 게시물 목록 조회
    @GetMapping("/list")
    public List<QnaDTO> findAllQnaList() {
        return qnaService.findAll();
    }

    // 게시물 추가
    @PostMapping
    public void addQna(@RequestBody Qna qna) {
        User user = new User();
        user.setId("sewon");
        qna.setUser(user);

        qnaService.addQna(qna);
    }

    /*
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
     */
}

