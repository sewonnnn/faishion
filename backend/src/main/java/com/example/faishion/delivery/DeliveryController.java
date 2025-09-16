package com.example.faishion.delivery;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/delivery")
public class DeliveryController {
    private final DeliveryService deliveryService;

    @PostMapping
    public ResponseEntity<Void> addDelivery(@RequestBody Delivery delivery) {
        delivery.setTrackingNumber(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")));
        deliveryService.addDelivery(delivery);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryDTO> getDelivery(@PathVariable Long id) {
        DeliveryDTO deliveryDTO = deliveryService.getDelivery(id);
        return ResponseEntity.ok(deliveryDTO);
    }
}
