package com.example.faishion.delivery;

import com.example.faishion.seller.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/delivery")
public class DeliveryController {
    private final DeliveryService deliveryService;
    private final SellerRepository sellerRepository;

    @PostMapping
    public ResponseEntity<Void> addDelivery(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Delivery delivery) {
        delivery.setSeller(sellerRepository.getReferenceById(userDetails.getUsername()));
        deliveryService.addDelivery(delivery);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryDTO> getDelivery(@PathVariable Long id) {
        DeliveryDTO deliveryDTO = deliveryService.getDelivery(id);
        return ResponseEntity.ok(deliveryDTO);
    }
}
