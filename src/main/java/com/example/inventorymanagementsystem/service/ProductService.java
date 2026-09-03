package com.example.inventorymanagementsystem.service;

import com.example.inventorymanagementsystem.dto.request.ProductRequest;
import com.example.inventorymanagementsystem.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    ProductResponse getProductById(Long id);

    List<ProductResponse> getAllProducts();

    List<ProductResponse> getProductsByCategory(Long categoryId);

    List<ProductResponse> getProductsBySupplier(Long supplierId);

    List<ProductResponse> getLowStockProducts();

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);
}
