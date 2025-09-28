package com.example.faishion.order;

import com.example.faishion.address.Address;
import com.example.faishion.delivery.Delivery;
import com.example.faishion.delivery.DeliveryDTO;
import com.example.faishion.product.Product;
import com.example.faishion.stock.Stock;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SellerOrderDTO {
    private Long id;
    private String businessName;
    private List<OrderItemDTO> orderItems;
    private String street;
    private String detail;
    private String zipcode;
    private String requestMsg;
    private DeliveryDTO delivery;

    public SellerOrderDTO(Order order) {
        this.id = order.getId();
        this.orderItems = order.getOrderItemList().stream()
                .map(OrderItemDTO::new)
                .toList();
        this.delivery = !order.getDeliveryList().isEmpty() ? new DeliveryDTO(order.getDeliveryList().get(0)) : null;
        this.requestMsg = order.getRequestMsg();
        this.street = order.getStreet();
        this.zipcode = order.getZipcode();
        this.detail = order.getDetail();
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
