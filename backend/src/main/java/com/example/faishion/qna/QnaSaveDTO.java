package com.example.faishion.qna;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QnaSaveDTO {
    private Long productId;
    private String title;
    private String content;

    @JsonProperty("isSecret")
    private boolean isSecret;
}
