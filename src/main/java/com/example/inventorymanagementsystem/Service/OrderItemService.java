package com.example.inventorymanagementsystem.Service;

import com.example.inventorymanagementsystem.Dtos.RequstDtos.OrderItemRequestDto;
import com.example.inventorymanagementsystem.Dtos.ResponseDtos.OrderItemResponseDto;

import java.util.List;

public interface OrderItemService {

    OrderItemResponseDto createOrderItem(OrderItemRequestDto dto);
    OrderItemResponseDto getOrderItemById(Long id);
    List<OrderItemResponseDto> getAllOrderItem();
    OrderItemResponseDto updateOrder(Long id, OrderItemRequestDto dto);
    void deleteOrderItem(Long id);
}
