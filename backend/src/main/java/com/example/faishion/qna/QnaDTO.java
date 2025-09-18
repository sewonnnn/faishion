package com.example.faishion.qna;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QnaDTO {
    private Long id; // 글번호
    private String user_id;
    private String title;
    private String content;
    private String answer; // 답변 내용
    private String answeredBy; //답변한 판매자
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

}
