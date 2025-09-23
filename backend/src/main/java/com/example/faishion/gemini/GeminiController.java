package com.example.faishion.gemini;

import com.example.faishion.cart.Cart;
import com.example.faishion.cart.CartRepository;
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

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/gemini")
@RequiredArgsConstructor
public class GeminiController {

    private final StockRepository stockRepository;
    private final CartRepository cartRepository;
    private final OkHttpClient client = new OkHttpClient.Builder()
            .readTimeout(60, TimeUnit.SECONDS)
            .build();
    private final Gson gson = new Gson();

    @Value("${google.api.key}")
    private String apiKey;

    @GetMapping("/")
    public String showHomePage() {
        return "index.html";
    }

    @GetMapping("/{productId}")
    @ResponseBody
    public String getProductImage(@PathVariable Long productId) {
        List<Stock> stocks = stockRepository.findByProductId(productId);

        JsonObject responseJson = new JsonObject();
        if (!stocks.isEmpty()) {
            Stock stock = stocks.get(0);
            Image image = stock.getImage();

            if (image != null) {
                String imageUrl = "/image/" + image.getId();
                responseJson.addProperty("imageUrl", imageUrl);
            } else {
                responseJson.addProperty("error", "해당 상품의 이미지가 없습니다.");
            }
        } else {
            responseJson.addProperty("error", "해당 상품의 재고를 찾을 수 없습니다.");
        }
        return gson.toJson(responseJson);
    }

    @GetMapping("/cart")
    @ResponseBody
    public String getCartImages() {
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
        return gson.toJson(cartItems);
    }

    @GetMapping("/cart-stocks")
    @ResponseBody
    public String getStockIdsFromCart(@RequestParam List<Long> ids) {
        List<Stock> stocks = new ArrayList<>();
        List<Cart> cartItems = cartRepository.findAllByIdIn(ids);
        for (Cart cart : cartItems) {
            if (cart.getStock() != null) {
                stocks.add(cart.getStock());
            }
        }
        List<Long> stockIds = stocks.stream()
                .map(Stock::getId)
                .collect(Collectors.toList());
        JsonObject responseJson = new JsonObject();
        JsonArray stockIdArray = new JsonArray();
        for (Long stockId : stockIds) {
            stockIdArray.add(stockId);
        }
        responseJson.add("stockIds", stockIdArray);
        return gson.toJson(responseJson);
    }

    @GetMapping("/cart-images")
    @ResponseBody
    public String getProductImagesFromStockIds(@RequestParam List<Long> ids) {
        List<Stock> stocks = stockRepository.findAllByIdIn(ids);
        List<String> imageUrls = stocks.stream()
                .filter(stock -> stock.getImage() != null)
                .map(stock -> "/image/" + stock.getImage().getId())
                .collect(Collectors.toList());
        JsonObject responseJson = new JsonObject();
        JsonArray imageUrlArray = new JsonArray();
        for (String url : imageUrls) {
            imageUrlArray.add(url);
        }
        responseJson.add("imageUrls", imageUrlArray);
        return gson.toJson(responseJson);
    }

    @PostMapping("/generate-image")
    @ResponseBody
    public String generateImage(@org.springframework.web.bind.annotation.RequestBody String requestBody) {
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("[백엔드] API 키가 설정되지 않았거나 유효하지 않습니다.");
            return "{\"error\": \"API key is not configured or is invalid\"}";
        }
        try {
            JsonObject requestJson = gson.fromJson(requestBody, JsonObject.class);
            String base64Image1 = requestJson.get("image1").getAsString();
            String base64Image2 = requestJson.get("image2").getAsString();

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

            Request request = new Request.Builder()
                    .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=" + apiKey)
                    .post(okhttp3.RequestBody.create(payloadString, MediaType.get("application/json; charset=utf-8")))
                    .build();

            try (Response response = client.newCall(request).execute()) {
                String responseBody = response.body().string();

                if (!response.isSuccessful()) {
                    System.err.println("[백엔드] Gemini API 요청 실패: " + response.code() + " - " + response.message());
                    return "{\"error\": \"" + response.code() + " - " + response.message() + "\"}";
                }

                try {
                    JsonObject jsonObject = gson.fromJson(responseBody, JsonObject.class);
                    JsonArray candidates = jsonObject.getAsJsonArray("candidates");
                    if (candidates == null || candidates.size() == 0) {
                        System.err.println("[백엔드] API 응답에서 candidates를 찾을 수 없습니다.");
                        return "{\"error\": \"No candidates found in API response.\"}";
                    }
                    JsonObject candidate = candidates.get(0).getAsJsonObject();
                    JsonArray parts = candidate.getAsJsonObject("content").getAsJsonArray("parts");
                    if (parts == null || parts.size() == 0) {
                        System.err.println("[백엔드] API 응답의 content에서 parts를 찾을 수 없습니다.");
                        return "{\"error\": \"No parts found in API response.\"}";
                    }
                    JsonObject imagePart = null;
                    for (JsonElement part : parts) {
                        JsonObject partObject = part.getAsJsonObject();
                        if (partObject.has("inlineData")) {
                            imagePart = partObject;
                            break;
                        }
                    }
                    if (imagePart != null && imagePart.has("inlineData")) {
                        String base64Data = imagePart.getAsJsonObject("inlineData").get("data").getAsString();
                        return "{\"base64Data\": \"" + base64Data + "\"}";
                    } else {
                        System.err.println("[백엔드] API 응답 형식 오류: 이미지 데이터 (inlineData)를 찾을 수 없음.");
                        return "{\"error\": \"Unexpected API response format. No image data found.\"}";
                    }
                } catch (JsonSyntaxException | NullPointerException e) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    System.err.println("[백엔드] API 응답 JSON 파싱 오류: " + sw.toString());
                    return "{\"error\": \"Failed to parse API response: Invalid JSON structure.\"}";
                }
            }
        } catch (IOException e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.err.println("[백엔드] 네트워크 오류 또는 타임아웃 발생: " + sw.toString());
            return "{\"error\": \"Image generation failed due to a network error or timeout.\"}";
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.err.println("[백엔드] 예상치 못한 오류 발생: " + sw.toString());
            return "{\"error\": \"An unexpected error occurred.\"}";
        }
    }
}