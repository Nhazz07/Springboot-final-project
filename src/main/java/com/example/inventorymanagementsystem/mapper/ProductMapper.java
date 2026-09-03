package com.example.inventorymanagementsystem.mapper;

import com.example.inventorymanagementsystem.dto.request.ProductRequest;
import com.example.inventorymanagementsystem.dto.response.ProductResponse;
import com.example.inventorymanagementsystem.entity.Category;
import com.example.inventorymanagementsystem.entity.Product;
import com.example.inventorymanagementsystem.entity.Supplier;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequest request, Category category, Supplier supplier) {
        return null;
    }

    public ProductResponse toResponse(Product product) {
        return null;
    }
}
