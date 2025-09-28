package com.example.faishion.order;

import com.example.faishion.delivery.Delivery;
import com.example.faishion.delivery.DeliveryStatus;
import com.example.faishion.stock.Stock;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailDTO {
    private Long id;
    private String clientOrderId;
    private String userName;
    private String street;
    private String detail;
    private String zipcode;
    private String requestMsg;
    private int totalAmount;
    private LocalDateTime orderDate;
    private List<OrderDTO> orders;

    public OrderDetailDTO(Order order) {
        this.id = order.getId();
        this.clientOrderId = order.getClientOrderId();
        this.userName = order.getUser().getName();
        this.street = order.getStreet();
        this.detail = order.getDetail();
        this.zipcode = order.getZipcode();
        this.requestMsg = order.getRequestMsg();
        this.orderDate = order.getCreatedAt();
        this.totalAmount = (int)order.getTotalAmount();
        // Delivery 리스트를 Seller ID를 키로 하는 Map으로 변환
        // Delivery는 Order와 Seller에 1:1 매핑된다고 가정
        Map<String, Delivery> deliveryMapBySellerId = order.getDeliveryList().stream()
            .collect(Collectors.toMap(
                    delivery -> delivery.getSeller().getId(), // 키: Seller ID
                    delivery -> delivery // 값: Delivery 엔티티
        ));
        Map<String, List<OrderItem>> groupedBySellerId = order.getOrderItemList().stream().collect(Collectors.groupingBy(
            orderItem -> orderItem.getStock().getProduct().getSeller().getId()
        ));
        this.orders = groupedBySellerId.entrySet().stream()
                .map(entry -> {
                    String sellerId = entry.getKey();
                    List<OrderItem> items = entry.getValue();
                    String sellerBusinessName = items.get(0).getStock().getProduct().getSeller().getBusinessName();
                    Delivery deliveryEntity = deliveryMapBySellerId.get(sellerId);
                    DeliveryDTO deliveryDTO = deliveryEntity != null ? new DeliveryDTO(deliveryEntity) : null; // 배송 정보가 없을 수도 있음
                    List<OrderItemDTO> itemDtos = items.stream()
                            .map(OrderItemDTO::new)
                            .collect(Collectors.toList());
                    return new OrderDTO(sellerId, sellerBusinessName, deliveryDTO, itemDtos);
                })
                .collect(Collectors.toList());
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryDTO {
        private String trackingNumber;
        private DeliveryStatus status;

        public DeliveryDTO(Delivery delivery){
            this.trackingNumber = delivery.getTrackingNumber();
            this.status = delivery.getStatus();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderDTO {
        private String sellerId;
        private String sellerBusinessName;
        private DeliveryDTO delivery;
        private List<OrderItemDTO> orderItems;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private Long imageId;
        private String name;
        private String color;
        private String size;
        private int quantity;
        private int price;
        private int originPrice;

        public OrderItemDTO(OrderItem orderItem){
            this.quantity = orderItem.getQuantity();
            this.price = orderItem.getPrice();
            Stock stock = orderItem.getStock();
            this.originPrice = stock.getProduct().getPrice();
            this.imageId = stock.getImage().getId();
            this.name = stock.getProduct().getName();
            this.color = stock.getColor();
            this.size = stock.getSize();
        }
    }
}
