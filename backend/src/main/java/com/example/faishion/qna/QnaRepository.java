package com.example.faishion.qna;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QnaRepository extends JpaRepository<Qna, Long> {

    // 전체 목록에 대한 페이징 기능
    Page<Qna> findAll(Pageable pageable);

    // 검색 기능과 페이징 기능을 함께 제공하는 메서드
    Page<Qna> findByTitleContaining(String title, Pageable pageable);

    // id로 게시물 찾기
    Optional<Qna> findById(Long id); // JPA가 자동으로 생성하는 메서드

    // 게시물 수정
    @Modifying
    @Query("UPDATE Qna q SET q.title = :title, q.content = :content WHERE q.id = :id")
    void updateBoard(@Param("title") String title, @Param("content") String content, @Param("id") long id);

    // 답변, 답변자(판매자) 추가
    @Modifying
    @Query("UPDATE Qna q SET q.answer = :answer, q.answeredBy = :answeredBy WHERE q.id = :id")
    void updateAnswer(@Param("answer") String answer, @Param("answeredBy") String answeredBy,@Param("id") long id);

    // 상품 개별 문의 리스트 가져오기
    List<Qna> findByProduct_Id(Long productId);
}
