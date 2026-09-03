package com.example.inventorymanagementsystem.service.impl;

import com.example.inventorymanagementsystem.dto.request.ProductRequest;
import com.example.inventorymanagementsystem.dto.response.ProductResponse;
import com.example.inventorymanagementsystem.service.ProductService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        return null;
    }

    @Override
    public ProductResponse getProductById(Long id) {
        return null;
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return List.of();
    }

    @Override
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return List.of();
    }

    @Override
    public List<ProductResponse> getProductsBySupplier(Long supplierId) {
        return List.of();
    }

    @Override
    public List<ProductResponse> getLowStockProducts() {
        return List.of();
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        return null;
    }

    @Override
    public void deleteProduct(Long id) {
    }
}
