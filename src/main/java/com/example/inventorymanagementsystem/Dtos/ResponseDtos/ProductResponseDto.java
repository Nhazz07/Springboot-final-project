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
public class ProductResponseDto {

    private Long id;

    private String name;

    private String description;

    private BigDecimal costPrice;

    private BigDecimal price;

    private Integer quantity;

    private Integer minStock;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
