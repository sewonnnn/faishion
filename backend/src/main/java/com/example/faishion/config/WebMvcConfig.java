package com.example.faishion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private String uploadPath = "file:///C:/uploads/"; // ReviewService에서 사용한 경로와 일치해야 함

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**") // 클라이언트가 접근할 URL 패턴
                .addResourceLocations(uploadPath); // 실제 파일이 저장된 로컬 경로
    }
}