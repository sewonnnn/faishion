package com.example.faishion.notice;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notice")
public class NoticeController {
    private final NoticeService noticeService;

    // 게시물 목록 조회 (검색 및 페이징 포함)
    @GetMapping("/list")
    public Page<NoticeDTO> getNoticeList(@RequestParam(value = "q", required = false) String searchQuery,
                                   @PageableDefault(size = 10,
                                           sort = "createdAt",
                                           direction = Sort.Direction.DESC) Pageable pageable) {
        System.out.println("컨트롤러 검색어: " + searchQuery);
        return noticeService.getNoticeList(searchQuery, pageable);
    }

    // 게시물 추가
    @PostMapping
    public void addQna(@RequestBody Notice notice) {
        noticeService.addQna(notice);
    }

    // 게시물 상세보기
    @GetMapping("/{id}")
    public NoticeDTO findNoticeById(@PathVariable long id) {
        return noticeService.findNoticeById(id);
    }

    // 게시물 수정
    @PutMapping("/{id}")
    public void updateNotice(@PathVariable long id, @RequestBody NoticeDTO noticeDTO) {
        String title = noticeDTO.getTitle();
        String content = noticeDTO.getContent();
        noticeService.updateBoard(title, content, id);
    }

    // 게시물 삭제
    @DeleteMapping("/{id}")
    public void deleteNotice(@PathVariable long id) {
        System.out.println("게시물 삭제 id:"+id);
        noticeService.deleteNotice(id);
    }
}
