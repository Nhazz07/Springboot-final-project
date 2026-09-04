package com.example.inventorymanagementsystem.service.impl;

import com.example.inventorymanagementsystem.dto.request.ProductRequest;
import com.example.inventorymanagementsystem.dto.response.ProductResponse;
import com.example.inventorymanagementsystem.entity.Category;
import com.example.inventorymanagementsystem.entity.Product;
import com.example.inventorymanagementsystem.entity.Supplier;
import com.example.inventorymanagementsystem.exception.BadRequestException;
import com.example.inventorymanagementsystem.exception.ResourceNotFoundException;
import com.example.inventorymanagementsystem.mapper.ProductMapper;
import com.example.inventorymanagementsystem.repository.CategoryRepository;
import com.example.inventorymanagementsystem.repository.ProductRepository;
import com.example.inventorymanagementsystem.repository.SupplierRepository;
import com.example.inventorymanagementsystem.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        String name = request.getName().trim();
        if (productRepository.existsByName(name)) {
            throw new BadRequestException("Product with name '" + name + "' already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        Product product = productMapper.toEntity(request, category, supplier);
        product.setName(name);

        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAllWithDetails().stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category", "id", categoryId);
        }
        return productRepository.findByCategoryIdWithDetails(categoryId).stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsBySupplier(Long supplierId) {
        if (!supplierRepository.existsById(supplierId)) {
            throw new ResourceNotFoundException("Supplier", "id", supplierId);
        }
        return productRepository.findBySupplierIdWithDetails(supplierId).stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        String name = request.getName().trim();
        if (!product.getName().equalsIgnoreCase(name) && productRepository.existsByName(name)) {
            throw new BadRequestException("Product with name '" + name + "' already exists");
        }

        if (!product.getCategory().getId().equals(request.getCategoryId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        if (!product.getSupplier().getId().equals(request.getSupplierId())) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
            product.setSupplier(supplier);
        }

        product.setName(name);
        product.setDescription(request.getDescription());
        product.setCostPrice(request.getCostPrice());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setMinStockLevel(request.getMinStockLevel());
        product.setImageUrl(request.getImageUrl());

        Product updated = productRepository.save(product);
        return productMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (product.getOrderItems() != null && !product.getOrderItems().isEmpty()) {
            throw new BadRequestException("Cannot delete product with id '" + id + "' because it is referenced in existing orders");
        }

        productRepository.delete(product);
    }
}

