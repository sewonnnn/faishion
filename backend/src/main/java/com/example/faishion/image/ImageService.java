package com.example.faishion.image;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ImageService {

    private final ImageRepository imageRepository;
    private final String uploadDir = "C:/upload/"; // 환경변수로 변경 가능

    public ImageService(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    // 이미지 저장
    public Image saveImage(MultipartFile file) throws IOException {
        String originName = file.getOriginalFilename();
        String savedName = System.currentTimeMillis() + "_" + originName;

        Path path = Paths.get(uploadDir + savedName);
        Files.createDirectories(path.getParent());
        file.transferTo(path);

        Image image = new Image();
        image.setOriginName(originName);
        image.setSavedName(savedName);

        return imageRepository.save(image);
    }

    // 이미지 반환 (Resource + MediaType)
    public Resource getImageResource(Long id) throws IOException {
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("이미지 없음: " + id));
        Path path = Paths.get(uploadDir + image.getSavedName());
        return new InputStreamResource(new FileInputStream(path.toFile()));
    }

    // 이미지 MIME 타입 반환
    public MediaType getMediaType(Long id) throws IOException {
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("이미지 없음: " + id));

        Path path = Paths.get(uploadDir + image.getSavedName());
        String contentType = Files.probeContentType(path); // 자동으로 MIME 타입 감지
        return MediaType.parseMediaType(contentType);
    }
}
