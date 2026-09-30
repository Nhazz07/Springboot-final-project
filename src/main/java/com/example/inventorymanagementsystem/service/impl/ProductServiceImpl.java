package com.example.inventorymanagementsystem.service.impl;

import com.example.inventorymanagementsystem.config.client.CloudinaryService;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductMapper productMapper;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request, MultipartFile file) {
        return createProduct(request, file != null && !file.isEmpty() ? List.of(file) : null);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request, List<MultipartFile> files) {
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

        List<String> uploadedUrls = new ArrayList<>();
        if (files != null) {
            for (MultipartFile f : files) {
                if (f != null && !f.isEmpty()) {
                    Map<?, ?> uploadResult = cloudinaryService.uploadProductImage(f);
                    String secureUrl = (String) uploadResult.get("secure_url");
                    if (secureUrl != null) {
                        uploadedUrls.add(secureUrl);
                    }
                }
            }
        }

        if (!uploadedUrls.isEmpty()) {
            product.setImages(new ArrayList<>(uploadedUrls));
            product.setImageUrl(uploadedUrls.get(0));
        } else if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            product.setImageUrl(request.getImageUrl());
            product.setImages(new ArrayList<>(List.of(request.getImageUrl())));
        }

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
    public ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile file) {
        return updateProduct(id, request, file != null && !file.isEmpty() ? List.of(file) : null);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, List<MultipartFile> files) {
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

        // Ensure legacy or existing cover imageUrl is preserved in images collection
        if (product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
            if (product.getImages() == null) {
                product.setImages(new ArrayList<>());
            }
            if (!product.getImages().contains(product.getImageUrl())) {
                product.getImages().add(0, product.getImageUrl());
            }
        }

        // Upload and append new images if provided
        List<String> newUploadedUrls = new ArrayList<>();
        if (files != null) {
            for (MultipartFile f : files) {
                if (f != null && !f.isEmpty()) {
                    Map<?, ?> uploadResult = cloudinaryService.uploadProductImage(f);
                    String secureUrl = (String) uploadResult.get("secure_url");
                    if (secureUrl != null) {
                        newUploadedUrls.add(secureUrl);
                    }
                }
            }
        }

        if (!newUploadedUrls.isEmpty()) {
            if (product.getImages() == null) {
                product.setImages(new ArrayList<>());
            }
            product.getImages().addAll(newUploadedUrls);
            if (product.getImageUrl() == null || product.getImageUrl().isBlank()) {
                product.setImageUrl(newUploadedUrls.get(0));
            }
        }

        // If explicit remaining images list provided, clean up removed images from Cloudinary
        if (request.getImages() != null && product.getImages() != null) {
            List<String> currentImages = new ArrayList<>(product.getImages());
            for (String currentUrl : currentImages) {
                if (!request.getImages().contains(currentUrl)) {
                    product.getImages().remove(currentUrl);
                    cloudinaryService.deleteImageByUrl(currentUrl);
                }
            }
            if (!product.getImages().contains(product.getImageUrl())) {
                product.setImageUrl(product.getImages().isEmpty() ? null : product.getImages().get(0));
            }
        }

        Product updated = productRepository.save(product);
        return productMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public ProductResponse addProductImages(Long id, List<MultipartFile> files) {
        Product product = productRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (files == null || files.isEmpty()) {
            throw new BadRequestException("At least one image file is required");
        }

        if (product.getImages() == null) {
            product.setImages(new ArrayList<>());
        }
        if (product.getImageUrl() != null && !product.getImageUrl().isBlank() && !product.getImages().contains(product.getImageUrl())) {
            product.getImages().add(0, product.getImageUrl());
        }

        for (MultipartFile f : files) {
            if (f != null && !f.isEmpty()) {
                Map<?, ?> uploadResult = cloudinaryService.uploadProductImage(f);
                String secureUrl = (String) uploadResult.get("secure_url");
                if (secureUrl != null) {
                    product.getImages().add(secureUrl);
                    if (product.getImageUrl() == null || product.getImageUrl().isBlank()) {
                        product.setImageUrl(secureUrl);
                    }
                }
            }
        }

        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse deleteProductImage(Long id, String imageUrl) {
        Product product = productRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (imageUrl == null || imageUrl.isBlank()) {
            throw new BadRequestException("Image URL must not be blank");
        }

        if (product.getImages() == null) {
            product.setImages(new ArrayList<>());
        }
        if (product.getImageUrl() != null && !product.getImageUrl().isBlank() && !product.getImages().contains(product.getImageUrl())) {
            product.getImages().add(0, product.getImageUrl());
        }

        product.getImages().remove(imageUrl);

        if (imageUrl.equals(product.getImageUrl())) {
            if (product.getImages() != null && !product.getImages().isEmpty()) {
                product.setImageUrl(product.getImages().get(0));
            } else {
                product.setImageUrl(null);
            }
        }

        Product saved = productRepository.save(product);
        cloudinaryService.deleteImageByUrl(imageUrl);
        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse setPrimaryProductImage(Long id, String imageUrl) {
        Product product = productRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (imageUrl == null || imageUrl.isBlank()) {
            throw new BadRequestException("Image URL must not be blank");
        }

        if (product.getImages() == null) {
            product.setImages(new ArrayList<>());
        }
        if (!product.getImages().contains(imageUrl)) {
            product.getImages().add(0, imageUrl);
        }
        product.setImageUrl(imageUrl);

        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (product.getOrderItems() != null && !product.getOrderItems().isEmpty()) {
            throw new BadRequestException("Cannot delete product with id '" + id + "' because it is referenced in existing orders");
        }

        Set<String> imagesToDelete = new HashSet<>();
        if (product.getImages() != null) {
            imagesToDelete.addAll(product.getImages());
        }
        if (product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
            imagesToDelete.add(product.getImageUrl());
        }

        productRepository.delete(product);

        for (String url : imagesToDelete) {
            cloudinaryService.deleteImageByUrl(url);
        }
    }
}

