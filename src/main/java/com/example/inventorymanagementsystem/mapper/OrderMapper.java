package com.example.inventorymanagementsystem.mapper;

import com.example.inventorymanagementsystem.dto.request.OrderRequest;
import com.example.inventorymanagementsystem.dto.response.OrderItemResponse;
import com.example.inventorymanagementsystem.dto.response.OrderResponse;
import com.example.inventorymanagementsystem.entity.Order;
import com.example.inventorymanagementsystem.entity.OrderItem;
import com.example.inventorymanagementsystem.entity.User;
import com.example.inventorymanagementsystem.entity.enums.OrderStatus;
import org.springframework.stereotype.Component;


import java.util.ArrayList;
import java.util.List;

@Component
public class OrderMapper {
    private final OrderItemMapper orderItemMapper;

    public OrderMapper(OrderItemMapper orderItemMapper) {
        this.orderItemMapper = orderItemMapper;
    }
    public static Order toEntity(OrderRequest request, User user) {
        Order order = new Order();

        order.setUser(user);
        order.setNotes(request.getNotes());
        return order;
    }

    public OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();

        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setNotes(order.getNotes());

        response.setUserId(order.getUser().getId());
        response.setUsername(order.getUser().getUsername());

        List<OrderItemResponse> items = new ArrayList<>();

        for (OrderItem orderItem : order.getOrderItems()) {
            items.add(orderItemMapper.toResponse(orderItem));
        }

        response.setItems(items);

        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        return response;
    }
}
