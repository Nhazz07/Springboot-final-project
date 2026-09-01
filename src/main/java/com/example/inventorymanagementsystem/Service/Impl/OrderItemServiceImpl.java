package com.example.inventorymanagementsystem.Service.Impl;

import com.example.inventorymanagementsystem.Dtos.RequstDtos.OrderItemRequestDto;
import com.example.inventorymanagementsystem.Dtos.ResponseDtos.OrderItemResponseDto;
import com.example.inventorymanagementsystem.Service.OrderItemService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemServiceImpl implements OrderItemService {
    @Override
    public OrderItemResponseDto createOrderItem(OrderItemRequestDto dto) {
        return null;
    }

    @Override
    public OrderItemResponseDto getOrderItemById(Long id) {
        return null;
    }

    @Override
    public List<OrderItemResponseDto> getAllOrderItem() {
        return List.of();
    }

    @Override
    public OrderItemResponseDto updateOrder(Long id, OrderItemRequestDto dto) {
        return null;
    }

    @Override
    public void deleteOrderItem(Long id) {

    }
}
