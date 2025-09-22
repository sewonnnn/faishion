package com.example.faishion.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // DTO @Valid 검증 실패 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> messages = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            String field = error.getField();
            String message;

            switch (field) {
                case "username" -> message = "아이디를 입력해주세요.";
                case "email" -> message = "올바른 이메일 형식으로 입력해주세요.";
                case "password" -> message = "비밀번호는 최소 8자 이상, 최대 64자까지 가능합니다.";
                case "name" -> message = "이름을 입력해주세요.";
                case "phoneNumber" -> message = "전화번호를 입력해주세요.";
                default -> message = "입력값이 올바르지 않습니다.";
            }

            messages.put(field, message);
        });

        // 첫 번째 에러 메시지만 반환
        String firstMessage = messages.values().stream().findFirst().orElse("입력값이 올바르지 않습니다.");
        return ResponseEntity.badRequest().body(firstMessage);
    }

    // IllegalArgumentException 처리 (중복 아이디/이메일 등)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
