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
import org.springframework.web.bind.annotation.*;

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
        System.out.println("페이지 번호: " + pageable.getPageNumber());
        System.out.println("페이지 크기: " + pageable.getPageSize());

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
        System.out.println("수정할 게시물 작성일:"+qnaDTO.getCreated_at());
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
}

