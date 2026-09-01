package com.example.inventorymanagementsystem.Service.Impl;

import com.example.inventorymanagementsystem.Dtos.RequstDtos.ProductRequestDto;
import com.example.inventorymanagementsystem.Dtos.ResponseDtos.ProductResponseDto;
import com.example.inventorymanagementsystem.Service.ProductService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {
    @Override
    public ProductResponseDto createProduct(ProductRequestDto dto) {
        return null;
    }

    @Override
    public ProductResponseDto getProductById(Long id) {
        return null;
    }

    @Override
    public List<ProductResponseDto> getAllProduct() {
        return List.of();
    }

    @Override
    public ProductResponseDto updateProduct(Long id, ProductRequestDto dto) {
        return null;
    }

    @Override
    public void deleteProduct(Long id) {

    }
}
