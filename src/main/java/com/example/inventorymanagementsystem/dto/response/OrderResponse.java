package com.example.inventorymanagementsystem.dto.response;

import com.example.inventorymanagementsystem.entity.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;

    private String orderNumber;

    private BigDecimal totalAmount;

    private OrderStatus status;

    private String notes;

    private Long userId;

    private String username;

    private List<OrderItemResponse> items;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
