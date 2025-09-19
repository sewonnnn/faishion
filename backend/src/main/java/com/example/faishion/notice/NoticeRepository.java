package com.example.faishion.notice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NoticeRepository extends JpaRepository<Notice,Long> {
    // 전체 목록에 대한 페이징 기능
    Page<Notice> findAll(Pageable pageable);

    // 검색 기능과 페이징 기능을 함께 제공하는 메서드
    Page<Notice> findByTitleContaining(String title, Pageable pageable);

    // id로 게시물 찾기
    Optional<Notice> findById(Long id); // JPA가 자동으로 생성하는 메서드

    // 게시물 수정
    @Modifying
    @Query("UPDATE Notice n SET n.title = :title, n.content = :content WHERE n.id = :id")
    void updateBoard(@Param("title") String title, @Param("content") String content, @Param("id") long id);
}
