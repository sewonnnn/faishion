package com.example.faishion.image;

import jakarta.transaction.Transactional;
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

    @Transactional
    public void deleteImage(Long id) throws IOException {
        // 1. 데이터베이스에서 이미지 정보 조회
        Image image = imageRepository.findById(id).orElseThrow();
        String savedFileName = image.getSavedName();
        // 2. 파일 시스템에서 실제 파일 삭제
        Path filePath = Paths.get(uploadDir + savedFileName);
        if (Files.exists(filePath)) {
            try {
                Files.delete(filePath);
                System.out.println("파일 시스템에서 삭제 성공: " + savedFileName);
            } catch (IOException e) {
                // 파일 삭제 실패 시 예외 처리 (e.g., 로그 기록)
                System.err.println("파일 삭제 실패: " + savedFileName + " - " + e.getMessage());
                throw new IOException("파일 삭제 실패: " + savedFileName, e);
            }
        } else {
            // 파일 시스템에 파일이 없는 경우 (DB에만 정보가 남아있는 경우)
            System.out.println("경고: 파일 시스템에 파일이 존재하지 않음: " + savedFileName);
        }
        // 3. 데이터베이스에서 이미지 정보 삭제
        imageRepository.delete(image);
        System.out.println("데이터베이스에서 삭제 성공: ID " + id);
    }

    @Transactional // DB와 파일 시스템 작업의 원자성을 보장
    public Image updateImage(Long id, MultipartFile newFile) throws IOException {
        // 1. 기존 이미지 정보 조회
        Image existingImage = imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("이미지 없음: " + id));
        String oldSavedName = existingImage.getSavedName();
        // 2. 파일 시스템에서 기존 파일 삭제
        Path oldFilePath = Paths.get(uploadDir + oldSavedName);
        if (Files.exists(oldFilePath)) {
            try {
                Files.delete(oldFilePath);
                System.out.println("기존 파일 삭제 성공: " + oldSavedName);
            } catch (IOException e) {
                // 파일 삭제 실패 시에도 DB 업데이트를 시도하지 않도록 예외를 다시 던집니다.
                System.err.println("기존 파일 삭제 실패: " + oldSavedName);
                throw new IOException("기존 파일 삭제 실패: " + oldSavedName, e);
            }
        }
        // 3. 새로운 파일 저장
        String newOriginName = newFile.getOriginalFilename();
        String newSavedName = System.currentTimeMillis() + "_" + newOriginName;
        Path newFilePath = Paths.get(uploadDir + newSavedName);
        Files.createDirectories(newFilePath.getParent());
        newFile.transferTo(newFilePath);
        // 4. 데이터베이스 정보 업데이트 및 저장
        existingImage.setOriginName(newOriginName);
        existingImage.setSavedName(newSavedName);
        return imageRepository.save(existingImage);
    }
}
