/*
package com.example.faishion.gemini;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.beans.factory.annotation.Value;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import java.io.IOException;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import java.util.concurrent.TimeUnit;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Base64;

@Controller
public class GeminiController {

    private final OkHttpClient client = new OkHttpClient.Builder()
            .readTimeout(60, TimeUnit.SECONDS)
            .build();
    private final Gson gson = new Gson();

    @Value("${google.api.key}")
    private String apiKey;

    @GetMapping("/")
    public String showHomePage() {
        System.out.println("GET / 요청 처리 - index.html 반환");
        return "index.html";
    }

    @PostMapping("/generate-image")
    @ResponseBody
    public String generateImage(@org.springframework.web.bind.annotation.RequestBody String requestBody) {
        System.out.println("POST /generate-image 요청 수신.");
        System.out.println("GOOGLE_API_KEY 존재 여부: " + (apiKey != null && !apiKey.isEmpty()));
        System.out.println("요청 본문 (일부): " + requestBody.substring(0, Math.min(requestBody.length(), 200)) + "...");

        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("API key is not configured or is invalid.");
            return "{\"error\": \"API key is not configured or is invalid\"}";
        }

        try {
            JsonObject requestJson = gson.fromJson(requestBody, JsonObject.class);
            String prompt = requestJson.get("prompt").getAsString();
            String base64Image1 = requestJson.get("image1").getAsString();
            String base64Image2 = requestJson.get("image2").getAsString();

            System.out.println("요청 파싱 완료: prompt='" + prompt + "', image1 길이=" + base64Image1.length() + ", image2 길이=" + base64Image2.length());

            // --- Gemini API 요청 페이로드 구성 ---
            JsonObject inlineData1 = new JsonObject();
            inlineData1.addProperty("mimeType", "image/png");
            inlineData1.addProperty("data", base64Image1);

            JsonObject part1 = new JsonObject();
            part1.add("inlineData", inlineData1);

            JsonObject inlineData2 = new JsonObject();
            inlineData2.addProperty("mimeType", "image/png");
            inlineData2.addProperty("data", base64Image2);

            JsonObject part2 = new JsonObject();
            part2.add("inlineData", inlineData2);

            JsonObject part3 = new JsonObject();
            part3.addProperty("text", prompt);

            JsonArray partsArray = new JsonArray();
            partsArray.add(part1);
            partsArray.add(part2);
            partsArray.add(part3);

            JsonObject contentObject = new JsonObject();
            contentObject.add("parts", partsArray);

            JsonArray contentsArray = new JsonArray();
            contentsArray.add(contentObject);

            JsonObject generationConfig = new JsonObject();
            JsonArray responseModalities = new JsonArray();
            responseModalities.add("IMAGE");
            generationConfig.add("responseModalities", responseModalities);

            JsonObject mainPayload = new JsonObject();
            mainPayload.add("contents", contentsArray);
            mainPayload.add("generationConfig", generationConfig);

            String payloadString = mainPayload.toString();
            System.out.println("Gemini API 요청 페이로드 (일부): " + payloadString.substring(0, Math.min(payloadString.length(), 200)) + "...");

            // --- Gemini API 요청 ---
            Request request = new Request.Builder()
                    .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=" + apiKey)
                    .post(okhttp3.RequestBody.create(payloadString, MediaType.get("application/json; charset=utf-8")))
                    .build();

            System.out.println("Gemini API로 요청 전송 중...");
            try (Response response = client.newCall(request).execute()) {
                String responseBody = response.body().string();
                System.out.println("Gemini API 응답 수신. 상태 코드: " + response.code());
                System.out.println("Gemini API 응답 본문 (일부): " + responseBody.substring(0, Math.min(responseBody.length(), 200)) + "...");

                if (!response.isSuccessful()) {
                    System.err.println("Gemini API 요청 실패: " + response.code() + " - " + response.message());
                    return responseBody; // 오류 응답 본문 반환
                }

                // --- API 응답 파싱 ---
                try {
                    JsonObject jsonObject = gson.fromJson(responseBody, JsonObject.class);
                    JsonArray candidates = jsonObject.getAsJsonArray("candidates");

                    if (candidates == null || candidates.size() == 0) {
                        System.err.println("API 응답에서 candidates를 찾을 수 없습니다.");
                        return "{\"error\": \"No candidates found in API response.\"}";
                    }

                    JsonObject candidate = candidates.get(0).getAsJsonObject();
                    JsonArray parts = candidate.getAsJsonObject("content").getAsJsonArray("parts");

                    if (parts == null || parts.size() == 0) {
                        System.err.println("API 응답의 content에서 parts를 찾을 수 없습니다.");
                        return "{\"error\": \"No parts found in API response.\"}";
                    }

                    // JsonArray에서 "inlineData"를 포함하는 객체 찾기
                    JsonObject imagePart = null;
                    for (JsonElement part : parts) {
                        JsonObject partObject = part.getAsJsonObject();
                        if (partObject.has("inlineData")) {
                            imagePart = partObject;
                            System.out.println("이미지 part (inlineData) 발견.");
                            break;
                        }
                    }

                    if (imagePart != null && imagePart.has("inlineData")) {
                        String base64Data = imagePart.getAsJsonObject("inlineData").get("data").getAsString();
                        // 추출된 Base64 데이터의 앞부분을 로깅하여 데이터 형식 확인
                        System.out.println("추출된 Base64 데이터 (앞 50자): " + base64Data.substring(0, Math.min(base64Data.length(), 50)) + "...");

                        // React에서 data:image/png;base64, 접두사를 처리할 수 있도록 그대로 반환
                        return "{\"base64Data\": \"" + base64Data + "\"}";
                    } else {
                        System.err.println("API 응답 형식 오류: 이미지 데이터 (inlineData)를 찾을 수 없음.");
                        return "{\"error\": \"Unexpected API response format. No image data found.\"}";
                    }

                } catch (JsonSyntaxException | NullPointerException e) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    System.err.println("API 응답 JSON 파싱 오류: " + sw.toString());
                    return "{\"error\": \"Failed to parse API response: Invalid JSON structure.\"}";
                }
            }
        } catch (IOException e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.err.println("네트워크 오류 또는 타임아웃 발생: " + sw.toString());
            return "{\"error\": \"Image generation failed due to a network error or timeout.\"}";
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.err.println("예상치 못한 오류 발생: " + sw.toString());
            return "{\"error\": \"An unexpected error occurred.\"}";
        }
    }
}
*/
