package com.example.inventorymanagementsystem.Dtos.ResponseDtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponseDto {

    private Long id;

    private Integer quantity;

    private BigDecimal unitPrice;

    private BigDecimal subTotal;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
