package com.example.inventorymanagementsystem.Service.Impl;

import com.example.inventorymanagementsystem.Dtos.RequstDtos.OrderRequestDto;
import com.example.inventorymanagementsystem.Dtos.ResponseDtos.OrderResponseDto;
import com.example.inventorymanagementsystem.Service.OrderService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {
    @Override
    public OrderResponseDto createOrder(OrderRequestDto dto) {
        return null;
    }

    @Override
    public OrderResponseDto getOrderById(Long id) {
        return null;
    }

    @Override
    public List<OrderResponseDto> getAllOrder() {
        return List.of();
    }

    @Override
    public OrderResponseDto updateOrder(Long id, OrderResponseDto dto) {
        return null;
    }

    @Override
    public void deleteOrder(Long Id) {

    }
}
