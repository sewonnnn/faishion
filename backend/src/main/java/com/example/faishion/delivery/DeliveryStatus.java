package com.example.faishion.delivery;

public enum DeliveryStatus {
    READY,            // 발송 전
    SHIPPED,          // 발송됨
    IN_TRANSIT,       // 배송 중
    OUT_FOR_DELIVERY, // 배달 중
    DELIVERED         // 배송 완료
}
