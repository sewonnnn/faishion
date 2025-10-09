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

    public BannerDTO(Product product, Banner defaultBanner, Banner personalBanner){
        this.productId = product.getId();
        this.imageId = product.getMainImageList().stream().findFirst().orElseThrow().getId();
        this.description = product.getDescription();
        this.businessName = product.getSeller().getBusinessName();
        this.aiImageId = defaultBanner.getImage().getId();
        if(personalBanner != null && personalBanner.getStatus() == BannerStatus.COMPLETED){
            this.aiImageId = personalBanner.getImage().getId();
        }
    }

}
