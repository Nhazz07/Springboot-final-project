package com.example.inventorymanagementsystem.mapper;

import com.example.inventorymanagementsystem.dto.request.OrderItemRequest;
import com.example.inventorymanagementsystem.dto.response.OrderItemResponse;
import com.example.inventorymanagementsystem.entity.Order;
import com.example.inventorymanagementsystem.entity.OrderItem;
import com.example.inventorymanagementsystem.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class OrderItemMapper {

    public OrderItem toEntity(OrderItemRequest request, Order order, Product product) {
        return null;
    }

    public OrderItemResponse toResponse(OrderItem orderItem) {
        return null;
    }
}
