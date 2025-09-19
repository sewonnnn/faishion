package com.example.faishion.notice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NoticeDTO {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime created_at;

    public NoticeDTO(Notice notice) {
        this.id = notice.getId();
        this.title = notice.getTitle();
        this.content = notice.getContent();
        this.created_at = notice.getCreatedAt();
    }
}

