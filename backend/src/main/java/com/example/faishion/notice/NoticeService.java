package com.example.faishion.notice;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class NoticeService {
    private final NoticeRepository noticeRepository;

    public Page<NoticeDTO> getNoticeList(String searchQuery, Pageable pageable) {
        Page<Notice> noticePage;

        if (searchQuery != null && !searchQuery.isEmpty()) {
            noticePage = noticeRepository.findByTitleContaining(searchQuery, pageable);
        } else {
            noticePage = noticeRepository.findAll(pageable);
        }

        // Notice Page를 NoticeDTO Page로 변환하여 반환
        return noticePage.map(NoticeDTO::new);
    }

    public void addQna(Notice notice) {
        noticeRepository.save(notice);
    }


    // 아이디로 상세보기
    public NoticeDTO findNoticeById(Long id) {
        Notice noticeEntity = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시물을 찾을 수 없습니다."));

        return new NoticeDTO(noticeEntity);
    }

    // 게시물 수정
    @Transactional
    public void updateBoard(String title, String content,long id) {
        noticeRepository.updateBoard(title,content, id);
    }

    // 게시물 삭제
    public void deleteNotice(long id) {
        noticeRepository.deleteById(id);
    }
}
