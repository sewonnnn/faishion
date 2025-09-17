package com.example.faishion.qna;

import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QnaService {
    private final QnaRepository qnaRepository;

    public List<QnaDTO> findAll() {
        return qnaRepository.findAll()
                .stream()
                .map(q -> new QnaDTO(q.getId(), q.getUser().getId(), q.getTitle(), q.getContent(), q.getAnswer(), q.getAnsweredBy() != null ? q.getAnsweredBy().getId() : null))
                .collect(Collectors.toList());
    }

    public void addQna(Qna qna) {
        qnaRepository.save(qna);
    }
}
