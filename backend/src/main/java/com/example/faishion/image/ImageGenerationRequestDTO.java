package com.example.faishion.image;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImageGenerationRequestDTO {
    private List<Long> imageIds;
    private String customPrompt;
}