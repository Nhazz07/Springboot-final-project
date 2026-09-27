package com.example.inventorymanagementsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;

    private String name;

    private String description;

    private BigDecimal costPrice;

    private BigDecimal price;

    private Integer quantity;

    private Integer minStockLevel;

    private String imageUrl;

    private Long categoryId;

    private String categoryName;

    private Long supplierId;

    private String supplierName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
