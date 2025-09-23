package com.example.faishion.qna;

import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequiredArgsConstructor
@RequestMapping("/qna")
public class QnaController {
    private final QnaService qnaService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    // 게시물 목록 조회 (검색 및 페이징 포함)
    @GetMapping("/list")
    public Page<QnaDTO> getQnaList(@RequestParam(value = "q", required = false) String searchQuery,
                                   @PageableDefault(size = 10,
                                           direction = Sort.Direction.DESC) Pageable pageable) {
        System.out.println("컨트롤러 검색어: " + searchQuery);
        return qnaService.getQnaList(searchQuery, pageable);
    }

    // 게시물 추가
    @PostMapping
    public void addQna(@RequestBody Qna qna) {

        User user = userRepository.getReferenceById("sewon"); //임시 아이디
        Product product = productRepository.getReferenceById(1L); //임시 상품

        qna.setUser(user); //임시 아이디 qna에 설정
        qna.setProduct(product); //임시 상품 qna에 설정

        qnaService.addQna(qna);
    }

    // 게시물 상세보기
    @GetMapping("/{id}")
    public QnaDTO findQnaById(@PathVariable long id) {
        return qnaService.findQnaById(id);
    }
    
    // 게시물 수정하기
    @PutMapping("/{id}")
    public void updateQna(@PathVariable long id, @RequestBody QnaDTO qnaDTO) {
        String title = qnaDTO.getTitle();
        String content = qnaDTO.getContent();
        qnaService.updateBoard(title, content, id);
    }

    // 게시물 삭제하기
    @DeleteMapping("/{id}")
    public void deleteQna(@PathVariable long id) {
        qnaService.deleteQna(id);
    }

    // 답변 추가하기
    @PutMapping("/answer/{id}")
    // JSON에 있는 필드만 DTO에 매핑하고, 나머지는 그냥 비워두는 방식으로 처리
    public void saveAnswer(@PathVariable long id, @RequestBody QnaDTO qnaDto) {
        qnaService.updateAnswer(id, qnaDto.getAnswer(), qnaDto.getAnswered_by());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<QnaResponseDTO>> getQuestionsByProductId(@PathVariable Long productId) {
        // qnaService에 상품 ID를 전달하여 해당 상품의 문의만 가져옵니다.
        List<Qna> questions = qnaService.findByProduct_Id(productId);

        // Qna 엔티티 리스트를 QnaResponseDTO 리스트로 변환
        List<QnaResponseDTO> responseDTOs = questions.stream()
                .map(qna -> {
                    String userName = (qna.getUser() != null) ? qna.getUser().getName() : "익명";
                    return new QnaResponseDTO(
                            qna.getId(),
                            userName,
                            qna.getTitle(),
                            qna.getContent(),
                            qna.isSecret(),
                            qna.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                    );
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseDTOs);
    }

    @PostMapping("/save")
    public ResponseEntity<String> addQuestion(@RequestBody QnaSaveDTO qnaSaveDTO) {
        try {
            Product product = productRepository.findById(qnaSaveDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

            // 임시 사용자
            User user = userRepository.getReferenceById("sewon");

            Qna qna = new Qna();
            qna.setTitle(qnaSaveDTO.getTitle());
            qna.setContent(qnaSaveDTO.getContent());
            qna.setSecret(qnaSaveDTO.isSecret()); // DTO에서 받은 isSecret 값을 엔티티에 설정
            qna.setUser(user);
            qna.setProduct(product);

            qnaService.addQna(qna);
            return ResponseEntity.status(HttpStatus.CREATED).body("문의가 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            System.err.println("문의 등록 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("문의 등록 중 오류가 발생했습니다.");
        }
    }
}

