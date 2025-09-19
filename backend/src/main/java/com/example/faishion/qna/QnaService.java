package com.example.faishion.qna;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import static com.example.faishion.qna.QnaDTO.*;

@Service
@RequiredArgsConstructor
public class QnaService {
    private final QnaRepository qnaRepository;

    public Page<QnaDTO> getQnaList(String searchQuery, Pageable pageable) {
        Page<Qna> qnaPage;

        if (searchQuery != null && !searchQuery.isEmpty()) {
            qnaPage = qnaRepository.findByTitleContaining(searchQuery, pageable);
        } else {
            qnaPage = qnaRepository.findAll(pageable);
        }

        // Qna Page를 QnaDTO Page로 변환하여 반환
        return qnaPage.map(QnaDTO::new);
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
                .answered_by(qnaEntity.getAnsweredBy() != null ? qnaEntity.getAnsweredBy().getId() : null)
                .created_at(qnaEntity.getCreatedAt())
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
