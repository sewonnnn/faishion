package com.example.faishion.qna;

import com.example.faishion.user.User;
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
    
    // 게시물 리스트 출력
    @GetMapping("/list")
    String findAllList(){
        List<Qna> qnaBoardList = new ArrayList<>();

        return "qnaBoardList";
    }

}
