package com.example.faishion.delivery;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryDTO {
    private Long id;
    private Long orderId;
    private String status;
    private String trackingNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DeliveryDTO(Delivery delivery) {
        this.id = delivery.getId();
        this.orderId = delivery.getOrder().getId();
        this.status = delivery.getStatus().getKoreanName();
        this.trackingNumber = delivery.getTrackingNumber();
        this.createdAt = delivery.getCreatedAt();
        this.updatedAt = delivery.getUpdatedAt();
    }
}
