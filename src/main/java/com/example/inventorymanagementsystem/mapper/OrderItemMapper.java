package com.example.inventorymanagementsystem.mapper;

import com.example.inventorymanagementsystem.dto.request.OrderItemRequest;
import com.example.inventorymanagementsystem.dto.response.OrderItemResponse;
import com.example.inventorymanagementsystem.entity.Order;
import com.example.inventorymanagementsystem.entity.OrderItem;
import com.example.inventorymanagementsystem.entity.Product;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OrderItemMapper {

    public OrderItem toEntity(OrderItemRequest request, Order order, Product product) {
        OrderItem orderItem = new OrderItem();

        orderItem.setProduct(product);
        orderItem.setQuantity(orderItem.getQuantity());
        orderItem.setUnitPrice(orderItem.getUnitPrice());
        return orderItem;
    }

    public OrderItemResponse toResponse(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();

        response.setId(orderItem.getId());

        response.setProductId(orderItem.getProduct().getId());
        response.setProductName(orderItem.getProduct().getName());

        response.setQuantity(orderItem.getQuantity());
        response.setUnitPrice(orderItem.getUnitPrice());

        response.setSubtotal(
                orderItem.getUnitPrice()
                        .multiply(BigDecimal.valueOf(orderItem.getQuantity()))
        );

        response.setCreatedAt(orderItem.getCreatedAt());
        response.setUpdatedAt(orderItem.getUpdatedAt());

        return response;
    }
}
