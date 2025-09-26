package com.example.faishion.qna;


// QnaResponseDTO 목록 조회용)
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QnaResponseDTO {
    private Long id;
    private String userName; // 작성자 이름
    private String title;
    private String content;
    private String answer;
    @JsonProperty("isSecret")
    private boolean isSecret; // 비밀글 여부
    private String createdAt;
    @JsonProperty("isMine")
    private boolean isMine; // 로그인 사용자와 작성자 사용자 일치여부
}