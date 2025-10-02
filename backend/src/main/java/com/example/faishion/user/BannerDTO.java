package com.example.faishion.user;

import com.example.faishion.product.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BannerDTO {
    Long productId;
    Long imageId;
    Long aiImageId;
    String description;
    String businessName;

    public BannerDTO(Product product, Long aiImageId){
        this.productId = product.getId();
        this.imageId = product.getMainImageList().stream().findFirst().orElseThrow().getId();
        this.aiImageId = aiImageId;
        this.description = product.getDescription();
        this.businessName = product.getSeller().getBusinessName();
    }

}
