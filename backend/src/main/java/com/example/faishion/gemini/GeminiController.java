/*
package com.example.faishion.gemini;

import com.example.faishion.image.Image;
import com.example.faishion.stock.Stock;
import com.example.faishion.stock.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
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
import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/gemini")
@RequiredArgsConstructor
public class GeminiController {

    private final StockRepository stockRepository;

    private final OkHttpClient client = new OkHttpClient.Builder()
            .readTimeout(60, TimeUnit.SECONDS)
            .build();
    private final Gson gson = new Gson();

    @Value("${google.api.key}")
    private String apiKey;

    // 루트 URL ('/')로 들어오는 GET 요청을 처리하여 index.html을 반환합니다.
    @GetMapping("/")
    public String showHomePage() {
//        System.out.println("GET / 요청 처리 - index.html 반환");
        return "index.html";
    }

    @GetMapping("/{productId}")
    @ResponseBody
    public String getProductImage(@PathVariable Long productId) {
//        System.out.println("GET /api/gemini/" + productId + " 요청 수신.");
        Stock stock = stockRepository.findByProductId(productId); // 선택된 상품 정보 가지고오기
        Image image = stock.getImage();

        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("imageUrl", "/api/image/"+image.getId());
//        System.out.println("productId " + productId + "에 대한 이미지 URL: " + image.getOriginName());

        return gson.toJson(responseJson);
    }

    @GetMapping("/cart")
    @ResponseBody
    public String getCartImages() {
//        System.out.println("GET /api/cart 요청 수신.");

        JsonArray cartItems = new JsonArray();
        String[] productIds = {"1", "2", "3"};
        String[] imageUrls = {
                "https://placehold.co/150x150/FFC0CB/000000?text=핑크+드레스",
                "https://placehold.co/150x150/ADD8E6/000000?text=파란색+자켓",
                "https://placehold.co/150x150/90EE90/000000?text=초록색+티셔츠"
        };

        for (int i = 0; i < productIds.length; i++) {
            JsonObject productJson = new JsonObject();
            productJson.addProperty("imageUrl", imageUrls[i]);

            JsonObject itemJson = new JsonObject();
            itemJson.add("product", productJson);
            cartItems.add(itemJson);
        }

//        System.out.println("장바구니 이미지 목록 반환.");
        return gson.toJson(cartItems);
    }

    // '/generate-image' 엔드포인트에 대한 POST 요청을 처리합니다.
    @PostMapping("/generate-image")
    @ResponseBody
    public String generateImage(@org.springframework.web.bind.annotation.RequestBody String requestBody) {
        System.out.println("POST /generate-image 요청 수신.");
        System.out.println("GOOGLE_API_KEY 존재 여부: " + (apiKey != null && !apiKey.isEmpty()));
        System.out.println("요청 본문 (일부): " + requestBody.substring(0, Math.min(requestBody.length(), 200)) + "...");

        // API 키가 설정되지 않았을 경우 오류를 반환합니다.
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("API key is not configured or is invalid.");
            return "{\"error\": \"API key is not configured or is invalid\"}";
        }

        try {
            // 요청 본문을 JSON 객체로 파싱합니다.
            JsonObject requestJson = gson.fromJson(requestBody, JsonObject.class);
            // 프런트엔드에서 전송한 두 이미지의 Base64 데이터를 추출합니다.
            String base64Image1 = requestJson.get("image1").getAsString(); // 상품 이미지
            String base64Image2 = requestJson.get("image2").getAsString(); // 모델 이미지

//            System.out.println("요청 파싱 완료: image1 길이=" + base64Image1.length() + ", image2 길이=" + base64Image2.length());

            // --- Gemini API 요청 페이로드 구성 ---
            // 프런트엔드에서 프롬프트를 보내지 않으므로, 백엔드에서 고정 프롬프트를 설정합니다.
            String prompt = "이 옷 사진을 사람 사진이 입고 있는 사진으로 합성해줘 키는 160cm이고 몸무게는 90kg야. 결과 이미지로만 응답해. 다른 텍스트는 포함하지마.";

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
            generationConfig.addProperty("temperature", 0);
            responseModalities.add("IMAGE");
            generationConfig.add("responseModalities", responseModalities);

            JsonObject mainPayload = new JsonObject();
            mainPayload.add("contents", contentsArray);
            mainPayload.add("generationConfig", generationConfig);

            String payloadString = mainPayload.toString();
//            System.out.println("Gemini API 요청 페이로드 (일부): " + payloadString.substring(0, Math.min(payloadString.length(), 200)) + "...");

            // --- Gemini API 요청 전송 ---
            Request request = new Request.Builder()
                    .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=" + apiKey)
                    .post(okhttp3.RequestBody.create(payloadString, MediaType.get("application/json; charset=utf-8")))
                    .build();

//            System.out.println("Gemini API로 요청 전송 중...");
            try (Response response = client.newCall(request).execute()) {
                String responseBody = response.body().string();
//                System.out.println("Gemini API 응답 수신. 상태 코드: " + response.code());
//                System.out.println("Gemini API 응답 본문 (일부): " + responseBody.substring(0, Math.min(responseBody.length(), 200)) + "...");

                // 응답이 성공적인지 확인합니다.
                if (!response.isSuccessful()) {
//                    System.err.println("Gemini API 요청 실패: " + response.code() + " - " + response.message());
                    return "{\"error\": \"" + response.code() + " - " + response.message() + "\"}";
                }

                // --- API 응답 파싱 ---
                try {
                    JsonObject jsonObject = gson.fromJson(responseBody, JsonObject.class);
                    JsonArray candidates = jsonObject.getAsJsonArray("candidates");

                    if (candidates == null || candidates.size() == 0) {
//                        System.err.println("API 응답에서 candidates를 찾을 수 없습니다.");
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
//                            System.out.println("이미지 part (inlineData) 발견.");
                            break;
                        }
                    }

                    if (imagePart != null && imagePart.has("inlineData")) {
                        String base64Data = imagePart.getAsJsonObject("inlineData").get("data").getAsString();
//                        System.out.println("추출된 Base64 데이터 (앞 50자): " + base64Data.substring(0, Math.min(base64Data.length(), 50)) + "...");
                        return "{\"base64Data\": \"" + base64Data + "\"}";
                    } else {
//                        System.err.println("API 응답 형식 오류: 이미지 데이터 (inlineData)를 찾을 수 없음.");
                        return "{\"error\": \"Unexpected API response format. No image data found.\"}";
                    }

                } catch (JsonSyntaxException | NullPointerException e) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
//                    System.err.println("API 응답 JSON 파싱 오류: " + sw.toString());
                    return "{\"error\": \"Failed to parse API response: Invalid JSON structure.\"}";
                }
            }
        } catch (IOException e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
//            System.err.println("네트워크 오류 또는 타임아웃 발생: " + sw.toString());
            return "{\"error\": \"Image generation failed due to a network error or timeout.\"}";
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
//            System.err.println("예상치 못한 오류 발생: " + sw.toString());
            return "{\"error\": \"An unexpected error occurred.\"}";
        }
    }
}
*/

