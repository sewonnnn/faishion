package com.example.faishion.delivery;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeliveryService {
    private final DeliveryRepository deliveryRepository;

    @Transactional
    public void addDelivery(Delivery delivery) {
        deliveryRepository.save(delivery);
    }

    public DeliveryDTO getDelivery(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
        return new DeliveryDTO(delivery); // DTO 변환
    }
}
