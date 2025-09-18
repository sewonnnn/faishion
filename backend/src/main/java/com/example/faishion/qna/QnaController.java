package com.example.faishion.qna;

import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/qna")
public class QnaController {
    private final QnaService qnaService;

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    // 게시물 목록 조회
    @GetMapping("/list")
    public List<QnaDTO> findAllQnaList() {
        return qnaService.findAll();
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
        System.out.println("수정할 게시물 작성일:"+qnaDTO.getCreated_at()); /*상세, 수정 페이지에서 시간null 나옴*/
        String title = qnaDTO.getTitle();
        String content = qnaDTO.getContent();
        qnaService.updateBoard(title, content, id);
    }

    // 게시물 삭제하기
    @DeleteMapping("/{id}")
    public void deleteQna(@PathVariable long id) {
        System.out.println("삭제 게시물 id:"+id);
        qnaService.deleteQna(id);
    }


}

