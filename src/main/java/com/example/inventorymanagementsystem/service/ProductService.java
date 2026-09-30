package com.example.inventorymanagementsystem.service;

import com.example.inventorymanagementsystem.dto.request.ProductRequest;
import com.example.inventorymanagementsystem.dto.response.ProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request, MultipartFile file);

    ProductResponse createProduct(ProductRequest request, List<MultipartFile> files);

    ProductResponse getProductById(Long id);

    List<ProductResponse> getAllProducts();

    List<ProductResponse> getProductsByCategory(Long categoryId);

    List<ProductResponse> getProductsBySupplier(Long supplierId);

    List<ProductResponse> getLowStockProducts();

    ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile file);

    ProductResponse updateProduct(Long id, ProductRequest request, List<MultipartFile> files);

    ProductResponse addProductImages(Long id, List<MultipartFile> files);

    ProductResponse deleteProductImage(Long id, String imageUrl);

    ProductResponse setPrimaryProductImage(Long id, String imageUrl);

    void deleteProduct(Long id);
}
