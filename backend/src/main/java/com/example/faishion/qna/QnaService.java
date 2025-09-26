package com.example.faishion.qna;

import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QnaService {
    private final QnaRepository qnaRepository;
    private final ProductRepository productRepository;
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

        return new QnaDTO(qnaEntity);
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


    @Transactional
    public List<Qna> findByProduct_Id(Long productId) {
        String currentUserId = "sewon"; // 임시 사용자 ID

        // 상품 정보를 가져와 판매자 ID를 확인
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));
        String sellerId = product.getSeller().getId();

        List<Qna> questions = qnaRepository.findByProduct_Id(productId);

        // 비밀글 필터링 로직
        return questions.stream()
                .filter(qna -> !qna.isSecret() || // 1. 비밀글이 아니거나
                        qna.getUser().getId().equals(currentUserId) || // 2. 현재 사용자가 작성자이거나
                        sellerId.equals(currentUserId) // 3. 현재 사용자가 판매자일 경우
                )
                .collect(Collectors.toList());
    }
}
