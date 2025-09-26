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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
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
    public void addQna(@RequestBody Qna qna, @AuthenticationPrincipal UserDetails userDetails) {

        Optional<User> userOptional = userRepository.findById(userDetails.getUsername());
        if (!userOptional.isPresent()) {
            return;
        }
        User user = userOptional.get();
        Product product = productRepository.getReferenceById(1L); //임시 상품

        qna.setUser(user); //임시 아이디 qna에 설정
        qna.setProduct(product); //임시 상품 qna에 설정

        qnaService.addQna(qna);
    }

    // 게시물 상세보기
    @GetMapping("/{id}")
    public QnaDTO findQnaById(@PathVariable long id) {
        System.out.println(id);
        System.out.println(qnaService.findQnaById(id));
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
    public ResponseEntity<List<QnaResponseDTO>> getQuestionsByProductId(@PathVariable Long productId, @AuthenticationPrincipal UserDetails userDetails) {
        List<Qna> questions = qnaService.findByProduct_Id(productId);
        String currentUsername = (userDetails != null) ? userDetails.getUsername() : null; // 현재 로그인된 사용자 ID (username)

        List<QnaResponseDTO> responseDTOs = questions.stream()
                .map(qna -> {
                    String userName = (qna.getUser() != null) ? qna.getUser().getId() : "익명";
                    boolean isUserLoggedIn = (currentUsername != null);
                    boolean isAuthor = isUserLoggedIn && qna.getUser() != null && currentUsername.equals(qna.getUser().getId());
                    // 비밀글인 경우
                    if (qna.isSecret()) {
                        if (isAuthor) {
                            // 현재 사용자가 글 작성자인 경우, 제목과 내용 모두 보여줌
                            return new QnaResponseDTO(
                                    qna.getId(),
                                    userName,
                                    qna.getTitle(),
                                    qna.getContent(),
                                    qna.getAnswer(),
                                    true,
                                    qna.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                                    true
                            );
                        } else {
                            // 다른 사용자의 비밀글은 내용과 제목 숨김 처리
                            return new QnaResponseDTO(
                                    qna.getId(),
                                    userName,
                                    "비밀글입니다",
                                    "🔒 비밀글입니다. 작성자만 열람할 수 있습니다.",
                                    qna.getAnswer(),
                                    true,
                                    qna.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                                    false
                            );
                        }
                    } else {
                        // 비밀글이 아닌 경우
                        return new QnaResponseDTO(
                                qna.getId(),
                                userName,
                                qna.getTitle(),
                                qna.getContent(),
                                qna.getAnswer(),
                                false,
                                qna.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                                isAuthor
                        );
                    }
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseDTOs);
    }

    @PostMapping("/save")
    public ResponseEntity<String> addQuestion(@RequestBody QnaSaveDTO qnaSaveDTO, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Product product = productRepository.findById(qnaSaveDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

            // 임시 사용자
            Optional<User> userOptional =  userRepository.findById(userDetails.getUsername());
            if (!userOptional.isPresent()) {
                return ResponseEntity.ok("로그인된 유저가 없습니다.");
            }
            System.out.println(qnaSaveDTO.isSecret()); // < 여기가 false로 나와 체크해서 보내도
            User user = userOptional.get();
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

