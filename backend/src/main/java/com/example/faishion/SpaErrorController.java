package com.example.faishion;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaErrorController implements ErrorController {

    // 404 발생 시 Spring Boot가 자동으로 포워딩하는 경로를 처리합니다.
    @RequestMapping("/error")
    public String handleError() {
        // 모든 처리되지 않은 요청을 SPA 진입점인 index.html로 포워딩
        return "forward:/";
    }
}