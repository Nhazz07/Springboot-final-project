package com.example.inventorymanagementsystem.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.inventorymanagementsystem.dto.request.ProductRequest;
import com.example.inventorymanagementsystem.dto.response.ApiResponse;
import com.example.inventorymanagementsystem.dto.response.ProductResponse;
import com.example.inventorymanagementsystem.service.ProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Endpoints for managing products, stock alerts, and media uploads")
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    // @Operation: use for Swagger UI displays a clear label next to the endpoint:
    @Operation(summary = "Create product with optional image upload", description = "Uploads image to Cloudinary (if provided), saves secure URL in DB, and creates product")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @ModelAttribute @Valid ProductRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        ProductResponse response = productService.createProduct(request, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Product created successfully"));
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
    @Operation(summary = "Update product by ID with optional image upload", description = "Uploads new image to Cloudinary (if provided) and updates DB")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @ModelAttribute @Valid ProductRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        ProductResponse response = productService.updateProduct(id, request, file);
        return ResponseEntity.ok(ApiResponse.success(response, "Product updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product by ID")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }
}
