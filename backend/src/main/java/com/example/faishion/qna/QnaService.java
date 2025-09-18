package com.example.faishion.qna;
import jakarta.transaction.Transactional;
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
                .map(q -> new QnaDTO(q.getId(),
                        q.getUser().getId(),   // user_id에 맞게 Long을 String으로 변환
                        q.getTitle(),
                        q.getContent(),
                        q.getAnswer(),
                        q.getAnsweredBy() != null ? q.getAnsweredBy().getId() : null,
                        q.getCreatedAt(),
                        q.getUpdatedAt()))
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

    // 게시물 수정
    @Transactional
    public void updateBoard(String title, String content,long id) {
        qnaRepository.updateBoard(title,content, id);
    }

    // 게시물 삭제
    public void deleteQna(long id) {
        qnaRepository.deleteById(id);
    }

    // 답변, 답변자(판매자) 추가하기
    @Transactional
    public void updateAnswer(long id, String answer, String answeredBy) {
        System.out.println("답변자 서비스 넘어옴:"+answeredBy);
        qnaRepository.updateAnswer(answer,answeredBy,id);
    }
}
