package com.example.inventorymanagementsystem.controller;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Collections;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.inventorymanagementsystem.config.client.CloudinaryService;
import com.example.inventorymanagementsystem.dto.request.ProductRequest;
import com.example.inventorymanagementsystem.dto.response.ApiResponse;
import com.example.inventorymanagementsystem.dto.response.ProductResponse;
import com.example.inventorymanagementsystem.exception.BadRequestException;
import com.example.inventorymanagementsystem.service.ProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Endpoints for managing products, stock alerts, and media uploads")
public class ProductController {

    private final ProductService productService;
    private final CloudinaryService cloudinaryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create product with optional image uploads (Multipart)", description = "Uploads images to Cloudinary (if provided), saves secure URLs in DB, and creates product")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @ModelAttribute @Valid ProductRequest request,
            @Parameter(description = "Product image files (multiple)")
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @Parameter(description = "Product image file (single)")
            @RequestParam(value = "file", required = false) MultipartFile file) {
        List<MultipartFile> allFiles = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            allFiles.addAll(files);
        } else if (file != null && !file.isEmpty()) {
            allFiles.add(file);
        }
        ProductResponse response = productService.createProduct(request, allFiles);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Product created successfully"));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a new product (JSON)", description = "Creates product with JSON body and image URLs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProductJson(
            @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request, Collections.emptyList());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Product created successfully"));
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a single product image to Cloudinary", description = "Uploads an image file to Cloudinary and returns the secure URL")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProductImage(
            @RequestParam("file") MultipartFile file) {
        Map<?, ?> result = cloudinaryService.uploadProductImage(file);
        String secureUrl = (String) result.get("secure_url");
        String publicId = (String) result.get("public_id");
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("imageUrl", secureUrl != null ? secureUrl : "", "publicId", publicId != null ? publicId : ""),
                "Image uploaded successfully"
        ));
    }

    @GetMapping
    @Operation(summary = "Get all products with category and supplier details")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        List<ProductResponse> response = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success(response, "Products retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Product retrieved successfully"));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get all products belonging to a specific category")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsByCategory(@PathVariable Long categoryId) {
        List<ProductResponse> response = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(response, "Products for category retrieved successfully"));
    }

    @GetMapping("/supplier/{supplierId}")
    @Operation(summary = "Get all products sourced from a specific supplier")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsBySupplier(@PathVariable Long supplierId) {
        List<ProductResponse> response = productService.getProductsBySupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success(response, "Products for supplier retrieved successfully"));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get products whose current quantity is at or below their minimum stock level")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStockProducts() {
        List<ProductResponse> response = productService.getLowStockProducts();
        return ResponseEntity.ok(ApiResponse.success(response, "Low-stock products retrieved successfully"));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update product by ID with optional image uploads", description = "Uploads new images to Cloudinary (if provided) and updates DB")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @ModelAttribute @Valid ProductRequest request,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        List<MultipartFile> allFiles = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            allFiles.addAll(files);
        } else if (file != null && !file.isEmpty()) {
            allFiles.add(file);
        }
        ProductResponse response = productService.updateProduct(id, request, allFiles);
        return ResponseEntity.ok(ApiResponse.success(response, "Product updated successfully"));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update product by ID (JSON)", description = "Updates product with JSON body and image URLs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProductJson(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request, Collections.emptyList());
        return ResponseEntity.ok(ApiResponse.success(response, "Product updated successfully"));
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload additional images for a product")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> addProductImages(
            @PathVariable Long id,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        List<MultipartFile> allFiles = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            allFiles.addAll(files);
        } else if (file != null && !file.isEmpty()) {
            allFiles.add(file);
        }
        if (allFiles.isEmpty()) {
            throw new BadRequestException("At least one image file is required");
        }
        ProductResponse response = productService.addProductImages(id, allFiles);
        return ResponseEntity.ok(ApiResponse.success(response, "Images uploaded successfully"));
    }

    @DeleteMapping("/{id}/images")
    @Operation(summary = "Delete an image from a product")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> deleteProductImage(
            @PathVariable Long id,
            @RequestParam("imageUrl") String imageUrl) {
        ProductResponse response = productService.deleteProductImage(id, imageUrl);
        return ResponseEntity.ok(ApiResponse.success(response, "Image deleted successfully"));
    }

    @PutMapping("/{id}/images/primary")
    @Operation(summary = "Set primary cover image for a product")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> setPrimaryImage(
            @PathVariable Long id,
            @RequestParam("imageUrl") String imageUrl) {
        ProductResponse response = productService.setPrimaryProductImage(id, imageUrl);
        return ResponseEntity.ok(ApiResponse.success(response, "Primary image updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product by ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }
}
