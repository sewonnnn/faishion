package com.example.faishion.qna;

import com.example.faishion.admin.Admin;
import com.example.faishion.admin.AdminRepository;
import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.seller.Seller;
import com.example.faishion.seller.SellerRepository;
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
    private final SellerRepository sellerRepository;
    private final AdminRepository adminRepository;

    // 게시물 목록 조회 (검색 및 페이징 포함)
    @GetMapping("/list")
    public Page<QnaDTO> getQnaList(@RequestParam(value = "q", required = false) String searchQuery,
                                   @PageableDefault(size = 10,
                                           direction = Sort.Direction.DESC) Pageable pageable) {
        return qnaService.getQnaList(searchQuery, pageable);
    }

    @PostMapping // 관리자에게 문의
    public void addQna(@RequestBody Qna qna, @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOptional = userRepository.findById(userDetails.getUsername());
        if (!userOptional.isPresent()) {
            return;
        }
        User user = userOptional.get();
        qna.setUser(user);
        qna.setQnaType("GENERAL"); // 💡 유형을 "GENERAL"로 설정 (Admin 확인)

        qnaService.addQna(qna);
    }

    // 게시물 상세보기
    @GetMapping("/{id}")
    public QnaDTO findQnaById(@PathVariable long id) {
        return qnaService.findQnaById(id);
    }

    // 게시물 수정하기 (⭐ 권한 체크 추가)
    @PutMapping("/{id}")
    public ResponseEntity<String> updateQna(@PathVariable long id,
                                            @RequestBody QnaDTO qnaDTO,
                                            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            Qna qna = qnaService.getQnaEntityById(id);
            // 💡 1. 작성자 본인인지 확인
            if (!qna.getUser().getId().equals(userDetails.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("수정 권한이 없습니다. (작성자만 수정 가능)");
            }
            // 💡 2. 관리자/판매자는 수정 불가
            boolean isAdminOrSeller = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SELLER"));

            // 관리자/판매자 계정은 수정 기능을 사용하지 못하게 하려면 아래 로직 사용
            if (isAdminOrSeller) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자/판매자 계정은 문의글 수정 권한이 없습니다.");
            }

            String title = qnaDTO.getTitle();
            String content = qnaDTO.getContent();
            qnaService.updateBoard(title, content, id);
            return ResponseEntity.ok("게시물이 성공적으로 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("수정 실패: " + e.getMessage());
        }
    }

    // 게시물 삭제하기 (⭐ 권한 체크 추가)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteQna(@PathVariable long id,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Qna qna = qnaService.getQnaEntityById(id);
            String loggedInUsername = userDetails.getUsername();

            // 💡 1. 작성자 본인 또는 ADMIN인지 확인
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!qna.getUser().getId().equals(loggedInUsername) && !isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("삭제 권한이 없습니다. (작성자 또는 관리자만 삭제 가능)");
            }

            qnaService.deleteQna(id);
            return ResponseEntity.ok("게시물이 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("삭제 실패: " + e.getMessage());
        }
    }


    // 답변 추가하기
    @PutMapping("/answer/{id}")
    public ResponseEntity<String> saveAnswer(@PathVariable long id,
                                             @RequestBody QnaAnswerDTO answerDTO,
                                             @AuthenticationPrincipal UserDetails userDetails) {

        String answerContent = answerDTO.getAnswer();

        if (answerContent == null || answerContent.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("답변 내용이 누락되었습니다.");
        }

        String loggedInUsername = userDetails.getUsername();
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSeller = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SELLER"));

        try {
            // 💡 1. 답변하려는 QnA 객체를 먼저 가져옵니다.
            Qna qna = qnaService.getQnaEntityById(id); // QnaService에 이 메서드가 있다고 가정
            String requiredType = qna.getQnaType();

            // 💡 2. 권한 및 유형 검증
            if (isAdmin) {
                // ADMIN은 GENERAL 문의만 답변 가능
                if (!"GENERAL".equals(requiredType)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("관리자는 일반 문의(GENERAL)만 답변할 수 있습니다.");
                }

                Admin admin = adminRepository.findById(loggedInUsername)
                        .orElseThrow(() -> new RuntimeException("등록된 관리자 정보가 없습니다."));

                qnaService.updateAnswerByAdmin(id, answerContent, admin);
                return ResponseEntity.ok("답변이 성공적으로 등록되었습니다. (ADMIN)");

            } else if (isSeller) {
                // SELLER는 PRODUCT 문의만 답변 가능
                if (!"PRODUCT".equals(requiredType)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("판매자는 상품 문의(PRODUCT)만 답변할 수 있습니다.");
                }

                Seller seller = sellerRepository.findById(loggedInUsername)
                        .orElseThrow(() -> new RuntimeException("등록된 판매자 정보가 없습니다."));

                // 💡 추가 로직: 해당 상품의 판매자인지 확인
                Product product = qna.getProduct();
                if (product == null) {
                    // QnaType이 PRODUCT인데 Product가 null이면 데이터 오류이므로 차단
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("상품 문의이나 상품 정보가 누락되었습니다.");
                }

                // 💡 로그인한 판매자와 상품을 등록한 판매자가 일치하는지 확인
                if (!product.getSeller().getId().equals(loggedInUsername)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 상품 문의에 답변할 권한이 없습니다. (상품 등록 판매자가 아님)");
                }

                // 권한 검증 통과 후 답변 등록
                qnaService.updateAnswerBySeller(id, answerContent, seller);
                return ResponseEntity.ok("답변이 성공적으로 등록되었습니다. (SELLER)");

            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("답변 권한이 없습니다.");
            }
        } catch (RuntimeException e) {
            // QnA를 찾지 못했거나 관리자/판매자 정보가 없을 때의 예외 처리
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("답변 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<QnaResponseDTO>> getQuestionsByProductId(@PathVariable Long productId, @AuthenticationPrincipal UserDetails userDetails) {
        String currentUsername = (userDetails != null) ? userDetails.getUsername() : null; // 현재 로그인된 사용자 ID (username)
        List<Qna> questions = qnaService.findByProduct_Id(productId, currentUsername);
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

    @PostMapping("/save") // 기존
    public ResponseEntity<String> addQuestion(@RequestBody QnaSaveDTO qnaSaveDTO, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Product product = productRepository.findById(qnaSaveDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

            // ... (유저 정보 가져오는 로직 유지) ...
            Optional<User> userOptional =  userRepository.findById(userDetails.getUsername());
            if (!userOptional.isPresent()) {
                return ResponseEntity.ok("로그인된 유저가 없습니다.");
            }
            User user = userOptional.get();

            Qna qna = new Qna();
            qna.setTitle(qnaSaveDTO.getTitle());
            qna.setContent(qnaSaveDTO.getContent());
            qna.setSecret(qnaSaveDTO.isSecret());
            qna.setUser(user);
            qna.setProduct(product);
            qna.setQnaType("PRODUCT"); // 💡 유형을 "PRODUCT"로 설정 (Seller 확인)

            qnaService.addQna(qna);
            return ResponseEntity.status(HttpStatus.CREATED).body("문의가 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            System.err.println("문의 등록 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("문의 등록 중 오류가 발생했습니다.");
        }
    }

    // 관리자/판매자 대시보드 전용 목록 조회
    @GetMapping("/dashboard/list")
    public ResponseEntity<Page<QnaDTO>> getDashboardQnaList(
            @RequestParam(value = "q", required = false) String searchQuery,
            @RequestParam(value = "pending", required = false, defaultValue = "false") boolean isPending, // 💡 isPending 파라미터 추가
            @PageableDefault(size = 10, direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {

        String requiredType = null;
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSeller = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SELLER"));

        if (isAdmin) {
            requiredType = "GENERAL";
        } else if (isSeller) {
            requiredType = "PRODUCT";
        }

        if (requiredType == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 💡 Service 메서드에 isPending을 전달
        Page<QnaDTO> qnaList = qnaService.getFilteredQnaList(requiredType, searchQuery, isPending, pageable);

        return ResponseEntity.ok(qnaList);
    }
}

