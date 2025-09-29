package com.example.faishion.qna;

import com.example.faishion.admin.Admin;
import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.seller.Seller;
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
    @Transactional
    public void deleteQna(long id) {
        qnaRepository.deleteById(id);
    }

    @Transactional
    public void updateAnswerBySeller(long id, String answer, Seller seller) {
        Qna qna = qnaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시물을 찾을 수 없습니다."));

        qna.setAnswer(answer);
        qna.setAnsweredBySeller(seller);
        qna.setAnsweredByAdmin(null); // 💡 ADMIN 필드는 null로 설정
        qnaRepository.save(qna);
    }

    // 2. 답변, 답변자(ADMIN) 추가하기 - ADMIN 전용 메서드 추가
    @Transactional
    public void updateAnswerByAdmin(long id, String answer, Admin admin) {
        Qna qna = qnaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시물을 찾을 수 없습니다."));

        qna.setAnswer(answer);
        qna.setAnsweredByAdmin(admin);
        qna.setAnsweredBySeller(null); // 💡 SELLER 필드는 null로 설정
        qnaRepository.save(qna);
    }


    @Transactional
    public List<Qna> findByProduct_Id(Long productId, String currentUserId) {

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

    public Qna getQnaEntityById(long id) {
        return qnaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 QnA를 찾을 수 없습니다."));
    }

    public Page<QnaDTO> getFilteredQnaList(String requiredType, String searchQuery, boolean isPending, Pageable pageable) {
        Page<Qna> qnaPage;

        if (searchQuery != null && !searchQuery.isEmpty()) {
            // 검색어가 있을 경우 (답변 상태 무시하고 제목 검색)
            // isPending 조건까지 포함한 복합 쿼리가 필요할 수 있으나, 일단 현재 TitleContaining 유지
            qnaPage = qnaRepository.findByQnaTypeAndTitleContaining(requiredType, searchQuery, pageable);

        } else if (isPending) {
            // ⭐ 수정: 새로운 Repository 메서드 사용
            // 답변 내용이 NULL이거나 빈 문자열('')인 경우만 조회
            qnaPage = qnaRepository.findPendingQnaByQnaType(requiredType, pageable);

        } else {
            // 💡 검색어가 없고, 전체 조회(isPending=false)인 경우
            qnaPage = qnaRepository.findByQnaType(requiredType, pageable);
        }

        return qnaPage.map(QnaDTO::new);
    }
}
