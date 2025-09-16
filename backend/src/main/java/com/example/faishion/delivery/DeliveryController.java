package com.example.faishion.delivery;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/delivery")
public class DeliveryController {
    private final DeliveryService deliveryService;

    @PostMapping
    public ResponseEntity<Void> addDelivery(@RequestBody Delivery delivery) {
        deliveryService.addDelivery(delivery);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryDTO> getDelivery(@PathVariable Long id) {
        DeliveryDTO deliveryDTO = deliveryService.getDelivery(id);
        return ResponseEntity.ok(deliveryDTO);
    }
}
