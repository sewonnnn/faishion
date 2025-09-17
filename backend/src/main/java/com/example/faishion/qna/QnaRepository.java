package com.example.faishion.qna;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QnaRepository extends JpaRepository<Qna, Long> {
    List<Qna> id(Long id);

    Optional<Qna> findById(Long id); // JPA가 자동으로 생성하는 메서드

}
