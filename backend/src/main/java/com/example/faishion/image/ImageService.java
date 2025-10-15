package com.example.faishion.image;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class ImageService {
    private final RestTemplate restTemplate;
    private final ImageRepository imageRepository;

    @Value("${image.upload.dir}") // 환경변수 없으면 기본값 사용
    private String uploadDir;

    @Value("${google.api.key}")
    private String googleApiKey;

    public ImageService(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
        this.restTemplate = new RestTemplate();
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

    public String getImageBase64(Long id) throws IOException {
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("이미지 없음: " + id));
        //파일 시스템의 전체 경로를 Path 객체로 가져옵니다.
        Path path = Paths.get(uploadDir + image.getSavedName());
        //파일을 바이트 배열로 읽어옵니다.
        byte[] fileContent = Files.readAllBytes(path);
        // 바이트 배열을 Base64 문자열로 인코딩하여 반환합니다.
        return Base64.getEncoder().encodeToString(fileContent);
    }

    @Async
    public CompletableFuture<Image> generateImage(List<Long> imageIds, String customPrompt) throws IOException {
        // HTTP 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", googleApiKey);
        // 요청 본문 (JSON) 생성
        // Content-Type이 application/json 이므로 Map/List 구조로 요청 본문을 만듭니다.
        List<Map<String, Object>> parts = new ArrayList<>();
        for (Long id : imageIds) {
            String imgBase64 = getImageBase64(id);
            String mimeType = getMediaType(id).toString();
            parts.add(Map.of("inline_data", Map.of(
                    "mime_type", mimeType,
                    "data", imgBase64
            )));
        }
        // 텍스트 프롬프트
        parts.add(Map.of("text", customPrompt));
        //Generation Config
        Map<String, Object> imageConfig = Map.of(
                "aspectRatio", "1:1"
        );
        Map<String, Object> generationConfig = Map.of(
                "temperature", 0, // AI 창의성 레벨 0~1
                "responseModalities", List.of("IMAGE"), // IMAGE 응답을 요청
                "imageConfig", imageConfig
        );
        // 최종 요청 본문 구조
        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", parts)
                ),
                "generationConfig", generationConfig // **generationConfig 추가**
        );
        HttpEntity<Map<String, ?>> entity = new HttpEntity<>(body, headers);
        // Gemini API 요청 URL
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent";
        // RestTemplate를 사용한 POST 요청 및 응답 받기
        ResponseEntity<String> response = restTemplate.postForEntity(
                url,
                entity,
                String.class
        );
        // 응답 처리 및 Base64 디코딩
        byte[] generatedImageBytes;
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode candidatesNode = rootNode.path("candidates");
            if (!candidatesNode.isArray() || candidatesNode.isEmpty()) {
                throw new RuntimeException("API 응답에서 'candidates' 데이터를 찾을 수 없습니다.");
            }
            JsonNode partsNode = candidatesNode.path(0).path("content").path("parts");
            if (!partsNode.isArray()) {
                throw new RuntimeException("API 응답에서 'parts' 배열을 찾을 수 없습니다.");
            }
            String generatedImageBase64 = null;
            // parts 배열을 순회하여 inline_data가 있는 part를 찾습니다.
            for (JsonNode partNode : partsNode) {
                JsonNode inlineDataNode = partNode.path("inlineData");
                // inlineData 내부의 "data" 필드를 확인합니다.
                JsonNode dataNode = inlineDataNode.path("data");
                if (!dataNode.isMissingNode() && dataNode.isTextual()) {
                    generatedImageBase64 = dataNode.asText();
                    break; // 이미지 데이터를 찾았으면 순회를 종료합니다.
                }
            }
            if (generatedImageBase64 != null) {
                // Base64 문자열을 byte 배열로 디코딩하여 반환
                generatedImageBytes = Base64.getDecoder().decode(generatedImageBase64);
            } else {
                throw new RuntimeException("API 응답에서 이미지 Base64 데이터를 찾을 수 없습니다 (inlineData.data 없음).");
            }
        } else {
            throw new RuntimeException("API 요청 실패: " + response.getStatusCode() + " - " + response.getBody());
        }
        return CompletableFuture.completedFuture(saveImage(
            new ByteArrayMultipartFile(
                generatedImageBytes,
                "generatedImage",
                "generatedImage.png",
                "image/png"
            )
        ));
    }
}
