package com.example.faishion.gemini;

import com.example.faishion.image.ImageService;
import com.example.faishion.product.Product;
import com.example.faishion.product.ProductRepository;
import com.example.faishion.product.ProductService;
import com.example.faishion.user.User;
import com.example.faishion.user.UserRepository;
import com.example.faishion.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GeminiService {
    private final ImageService imageService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Value("${google.api.key}")
    private String apiKey;

    public void createUserBannerImage(String userId) throws IOException {
        int bannerSize = 8;
        User user = userRepository.findById(userId).orElseThrow();
        String userImageBase64 = imageService.getImageBase64(user.getImage().getId());

        /*
        List<Long> productImageIds = productRepository.findAll(PageRequest.of(0, minSize)).getContent()
                .stream().map((product)->
                    product.getMainImageList().stream().findFirst().orElseThrow().getId()
                ).toList();

         */
        //productImageIds

    }

}
