package com.example.faishion.gemini;

import com.example.faishion.cart.Cart;
import com.example.faishion.cart.CartRepository;
import com.example.faishion.image.Image;
import com.example.faishion.stock.Stock;
import com.example.faishion.stock.StockRepository;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    private final UserRepository userRepository;
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

    /**
     * 사용자 이미지 URL을 가져와 JSON 응답에 추가합니다.
     * 이미지가 없는 경우 "userImageUrl" 속성에 null 값을 추가합니다.
     * 이 유틸리티 메서드는 두 개의 GetMapping에서 모두 사용됩니다.
     */
    private void addUserImageUrl(JsonObject responseJson, UserDetails userDetails) {
        Optional<User> userOptional = userRepository.findById(userDetails.getUsername());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // 사용자 객체는 존재하지만, user.getImage()가 null일 수 있습니다.
            if (user.getImage() != null) {
                String userImageUrl = "/image/" + user.getImage().getId();
                responseJson.addProperty("userImageUrl", userImageUrl);
            } else {
                // 사용자는 존재하지만 이미지가 없는 경우, null을 명시적으로 추가
                responseJson.addProperty("userImageUrl", (String) null);
            }
        } else {
            // 사용자를 찾을 수 없는 경우에도 null을 명시적으로 추가
            responseJson.addProperty("userImageUrl", (String) null);
        }
    }


    @GetMapping("/{productId}")
    @ResponseBody // 상품 상세보기에서 바로 이동
    public String getProductImage(@PathVariable Long productId, @AuthenticationPrincipal UserDetails userDetails) {
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

        // ⭐ 사용자 이미지 URL 추가 로직 (수정)
        addUserImageUrl(responseJson, userDetails);

        return gson.toJson(responseJson);
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
    @ResponseBody // 카트에 담아서 AI 이동
    public String getProductImagesFromStockIds(@RequestParam List<Long> ids, @AuthenticationPrincipal UserDetails userDetails) {
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

        // ⭐ 사용자 이미지 URL 추가 로직 (수정)
        addUserImageUrl(responseJson, userDetails);

        return gson.toJson(responseJson);
    }

    @PostMapping("/generate-image")
    @ResponseBody
    public String generateImage(@org.springframework.web.bind.annotation.RequestBody String requestBody, @AuthenticationPrincipal UserDetails userDetails) {
        Optional<User> userOptional = userRepository.findById(userDetails.getUsername());
        User user = new User();
        if (userOptional.isPresent()) {
            user = userOptional.get();

        }
        if (apiKey == null || apiKey.isEmpty()) {
            return "{\"error\": \"API key is not configured or is invalid\"}";
        }
        try {
            JsonObject requestJson = gson.fromJson(requestBody, JsonObject.class);
            // 프런트엔드에서 배열로 전송된 Base64 데이터를 가져옴
            JsonArray base64Images = requestJson.getAsJsonArray("image1");
            String base64ModelImage = requestJson.get("image2").getAsString();

            String prompt ="**CRITICAL: The face of the person in image1 must be kept identical to the original ID photo, without any modification or alteration whatsoever.** image1 is a full-body image of a person. All subsequent images (from image2 to imageX, up to six images total) are fashion items, which can include one or more complete outfits or individual pieces. Create a single photorealistic full-body image of the person from image1, explicitly showing them wearing and fully styled with all the fashion items from the other images. **Ensure the fit, design, color, and texture of the clothing items are highly accurate to their source images.** The person should have a height of " +
                    user.getHeight()+"cm and a weight of "+user.getWeight()+"kg, ensuring their body shape and proportions are consistent with these measurements. Focus on seamless integration of all items, maintaining a realistic fit, natural proportions, high-quality textures, and appropriate lighting around the preserved face.";


            JsonArray partsArray = new JsonArray();

            // 선택된 모든 상품 이미지들을 partsArray에 추가
            for (JsonElement base64ImageElement : base64Images) {
                String base64Data = base64ImageElement.getAsString();
                JsonObject inlineData = new JsonObject();
                inlineData.addProperty("mimeType", "image/png");
                inlineData.addProperty("data", base64Data);
                JsonObject part = new JsonObject();
                part.add("inlineData", inlineData);
                partsArray.add(part);
            }

            // 모델 이미지 추가
            JsonObject inlineModelData = new JsonObject();
            inlineModelData.addProperty("mimeType", "image/png");
            inlineModelData.addProperty("data", base64ModelImage);
            JsonObject modelPart = new JsonObject();
            modelPart.add("inlineData", inlineModelData);
            partsArray.add(modelPart);

            // 프롬프트 텍스트 추가
            JsonObject promptPart = new JsonObject();
            promptPart.addProperty("text", prompt);
            partsArray.add(promptPart);

            JsonObject contentObject = new JsonObject();
            contentObject.add("parts", partsArray);

            JsonArray contentsArray = new JsonArray();
            contentsArray.add(contentObject);

            JsonObject generationConfig = new JsonObject();
            JsonArray responseModalities = new JsonArray();
            generationConfig.addProperty("temperature", 0); // Ai 창의성 레벨 0~1
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
                    return "{\"error\": \"" + response.code() + " - " + response.message() + "\"}";
                }

                try {
                    JsonObject jsonObject = gson.fromJson(responseBody, JsonObject.class);
                    JsonArray candidates = jsonObject.getAsJsonArray("candidates");
                    if (candidates == null || candidates.size() == 0) {
                        return "{\"error\": \"No candidates found in API response.\"}";
                    }
                    JsonObject candidate = candidates.get(0).getAsJsonObject();
                    JsonArray parts = candidate.getAsJsonObject("content").getAsJsonArray("parts");
                    if (parts == null || parts.size() == 0) {
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
                        return "{\"error\": \"Unexpected API response format. No image data found.\"}";
                    }
                } catch (JsonSyntaxException | NullPointerException e) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    return "{\"error\": \"Failed to parse API response: Invalid JSON structure.\"}";
                }
            }
        } catch (IOException e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            return "{\"error\": \"Image generation failed due to a network error or timeout.\"}";
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            return "{\"error\": \"An unexpected error occurred.\"}";
        }
    }
}