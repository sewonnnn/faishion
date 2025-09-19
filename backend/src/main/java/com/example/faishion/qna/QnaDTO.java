package com.example.faishion.qna;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QnaDTO {
    private Long id; // 글번호
    private String user_id;
    private String title;
    private String content;
    private String answer; // 답변 내용
    private String answered_by; //답변한 판매자
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public QnaDTO(Qna qna) {
        this.id = qna.getId();
        this.user_id = qna.getUser().getId(); // Qna의 User 객체에서 ID를 가져옴
        this.title = qna.getTitle();
        this.content = qna.getContent();
        this.answer = qna.getAnswer();
        this.created_at = qna.getCreatedAt();
        this.updated_at = qna.getUpdatedAt();

        if (qna.getUser() != null) {
            this.user_id = qna.getUser().getId();
        }

        if (qna.getAnsweredBy() != null) {
            this.answered_by = qna.getAnsweredBy().getId();
        }
    }
}
