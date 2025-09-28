package com.example.faishion.delivery;

public enum DeliveryStatus {
    SHIPPED("택배사 집하 완료"),
    IN_TRANSIT("상품 이동 중"),
    OUT_FOR_DELIVERY("최종 배달 출발"),
    DELIVERED("배송 완료");

    private final String koreanName;

    DeliveryStatus(String koreanName) {
        this.koreanName = koreanName;
    }

    public String getKoreanName() {
        return koreanName;
    }
}