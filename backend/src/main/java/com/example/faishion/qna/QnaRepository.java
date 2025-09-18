package com.example.faishion.qna;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QnaRepository extends JpaRepository<Qna, Long> {
    List<Qna> id(Long id);

    Optional<Qna> findById(Long id); // JPA가 자동으로 생성하는 메서드

    // 게시물 수정
    @Modifying
    @Query("UPDATE Qna q SET q.title = :title, q.content = :content WHERE q.id = :id")
    void updateBoard(@Param("title") String title, @Param("content") String content, @Param("id") long id);

    // 답변, 답변자(판매자) 추가
    @Modifying
    @Query("UPDATE Qna q SET q.answer = :answer, q.answeredBy = :answeredBy WHERE q.id = :id")
    void updateAnswer(@Param("answer") String answer, @Param("answeredBy") String answeredBy,@Param("id") long id);
}
