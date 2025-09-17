package com.example.faishion.qna;

import com.example.faishion.seller.Seller;
import com.example.faishion.user.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class QnaDTO {
    private Long id; // 글번호
    private String userId; // 회원 Id
    private String title;
    private String content;
    private String answer; // 답변 내용
    private String answeredBy; //답변한 판매자
}
