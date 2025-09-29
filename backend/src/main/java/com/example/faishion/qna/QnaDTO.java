package com.example.faishion.qna;

import com.example.faishion.product.Product;
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
    private String productName;
    private String qnaType;

    private boolean answered; // 💡 새로 추가: 답변 완료 상태
    public boolean getIsAnswered() {
        return this.answered; // 필드 이름은 answered로, 게터는 isAnswered()로 동작하도록 합니다.
    }

    public QnaDTO(Qna qna) {
        this.id = qna.getId();

        // Null-safe user_id 설정
        this.user_id = (qna.getUser() != null) ? qna.getUser().getId() : null;

        this.title = qna.getTitle();
        this.content = qna.getContent();
        this.answer = qna.getAnswer();
        this.created_at = qna.getCreatedAt();
        this.updated_at = qna.getUpdatedAt();
        this.qnaType = qna.getQnaType();

        // 💡 product null-check를 통해 안전하게 productName 설정
        if (qna.getProduct() != null) {
            this.productName = qna.getProduct().getName();
        } else {
            this.productName = "일반 문의";
        }

        // 답변자 표시 로직 유지
        if (qna.getAnsweredBySeller() != null) {
            this.answered_by = qna.getAnsweredBySeller().getOwnerName();
        } else if (qna.getAnsweredByAdmin() != null) {
            this.answered_by = qna.getAnsweredByAdmin().getName();
        } else {
            this.answered_by = null;
        }

        // 💡 isAnswered 설정: answer 필드가 null이 아니고 내용이 비어있지 않으면 true

        this.answered = qna.getAnswer() != null && !qna.getAnswer().trim().isEmpty();
    }
}