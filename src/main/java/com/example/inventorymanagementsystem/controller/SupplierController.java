package com.example.inventorymanagementsystem.controller;

import com.example.inventorymanagementsystem.dto.request.SupplierRequest;
import com.example.inventorymanagementsystem.dto.response.ApiResponse;
import com.example.inventorymanagementsystem.dto.response.SupplierResponse;
import com.example.inventorymanagementsystem.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "Endpoints for managing inventory suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new supplier with optional image upload")
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplierMultipart(
            @ModelAttribute @Valid SupplierRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        SupplierResponse response = supplierService.createSupplier(request, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Supplier created successfully"));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a new supplier (JSON)")
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplierJson(@Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.createSupplier(request, null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Supplier created successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all suppliers")
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> getAllSuppliers() {
        List<SupplierResponse> response = supplierService.getAllSuppliers();
        return ResponseEntity.ok(ApiResponse.success(response, "Suppliers retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID")
    public ResponseEntity<ApiResponse<SupplierResponse>> getSupplierById(@PathVariable Long id) {
        SupplierResponse response = supplierService.getSupplierById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Supplier retrieved successfully"));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update supplier by ID with optional image upload")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplierMultipart(
            @PathVariable Long id,
            @ModelAttribute @Valid SupplierRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        SupplierResponse response = supplierService.updateSupplier(id, request, file);
        return ResponseEntity.ok(ApiResponse.success(response, "Supplier updated successfully"));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update supplier by ID (JSON)")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplierJson(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.updateSupplier(id, request, null);
        return ResponseEntity.ok(ApiResponse.success(response, "Supplier updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete supplier by ID")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Supplier deleted successfully"));
    }
}
