package com.example.faishion.delivery;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DeliveryScheduler {
    private final DeliveryRepository deliveryRepository;

    @Scheduled(fixedRate = 30 * 1000) //30초마다 실행
    public void updateDeliveryStatus() {
        List<Delivery> deliveries = deliveryRepository.findByStatusNot(DeliveryStatus.DELIVERED);
        deliveries.forEach(delivery -> {
            switch (delivery.getStatus()) {
                case SHIPPED:
                    delivery.setStatus(DeliveryStatus.IN_TRANSIT);
                    break;
                case IN_TRANSIT:
                    delivery.setStatus(DeliveryStatus.OUT_FOR_DELIVERY);
                    break;
                case OUT_FOR_DELIVERY:
                    delivery.setStatus(DeliveryStatus.DELIVERED);
                    break;
                case DELIVERED:
                    break;
            }
        });
        deliveryRepository.saveAll(deliveries);
    }
}
