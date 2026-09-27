package com.example.inventorymanagementsystem.service;

import com.example.inventorymanagementsystem.dto.request.OrderRequest;
import com.example.inventorymanagementsystem.dto.response.OrderResponse;
import com.example.inventorymanagementsystem.entity.enums.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request);

    OrderResponse getOrderById(Long id);

    OrderResponse getOrderByOrderNumber(String orderNumber);

    List<OrderResponse> getAllOrders();

    List<OrderResponse> getOrdersByUserId(Long userId);

    OrderResponse updateOrderStatus(Long id, OrderStatus status);

    void deleteOrder(Long id);
}
