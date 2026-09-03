package com.example.inventorymanagementsystem.service.impl;

import com.example.inventorymanagementsystem.dto.request.OrderRequest;
import com.example.inventorymanagementsystem.dto.response.OrderResponse;
import com.example.inventorymanagementsystem.entity.enums.OrderStatus;
import com.example.inventorymanagementsystem.service.OrderService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Override
    public OrderResponse createOrder(OrderRequest request) {
        return null;
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        return null;
    }

    @Override
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        return null;
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return List.of();
    }

    @Override
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return List.of();
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        return null;
    }

    @Override
    public void deleteOrder(Long id) {
    }
}
