package com.example.faishion.qna;

import com.example.faishion.seller.Seller;
import com.example.faishion.user.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QnaDTO {

    private int id; // 글번호
    private User user; // 회원 정보
    private String title;
    private String content;
    private String answer; // 답변 내용

    private Seller answeredBy; //답변한 판매자
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
