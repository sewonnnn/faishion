package com.example.faishion.qna;

import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.example.faishion.qna.QnaDTO.*;

@Service
@RequiredArgsConstructor
public class QnaService {
    private final QnaRepository qnaRepository;

    public List<QnaDTO> findAll() {
        return qnaRepository.findAll()
                .stream()
                .map(q -> new QnaDTO(q.getId(), q.getUser().getId(), q.getTitle(), q.getContent(), q.getAnswer(), q.getAnsweredBy() != null ? q.getAnsweredBy().getId() : null))
                .collect(Collectors.toList());
    }

    public void addQna(Qna qna) {
        qnaRepository.save(qna);
    }

        // 아이디로 상세보기
    public QnaDTO findQnaById(Long id) {
        Qna qnaEntity = qnaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시물을 찾을 수 없습니다."));

        // DTO 빌더 패턴으로 변환
        return builder()
                .id(qnaEntity.getId())
                .user_id(qnaEntity.getUser().getId()) // user 엔티티에서 ID를 가져오기
                .title(qnaEntity.getTitle())
                .content(qnaEntity.getContent())
                .answer(qnaEntity.getAnswer())
                .answeredBy(qnaEntity.getAnsweredBy() != null ? qnaEntity.getAnsweredBy().getId() : null)
                .build();
    }
}
