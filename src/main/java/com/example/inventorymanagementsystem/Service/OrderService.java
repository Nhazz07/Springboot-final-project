package com.example.inventorymanagementsystem.Service;

import com.example.inventorymanagementsystem.Dtos.RequstDtos.OrderRequestDto;
import com.example.inventorymanagementsystem.Dtos.ResponseDtos.OrderResponseDto;

import java.util.List;

public interface OrderService {
    OrderResponseDto createOrder(OrderRequestDto dto);
    OrderResponseDto getOrderById(Long id);
    List<OrderResponseDto> getAllOrder();
    OrderResponseDto updateOrder(Long id, OrderResponseDto dto);
    void deleteOrder(Long Id);
}
