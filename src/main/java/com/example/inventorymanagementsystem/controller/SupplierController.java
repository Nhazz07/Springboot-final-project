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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "Endpoints for managing inventory suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    @Operation(summary = "Create a new supplier")
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(@Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.createSupplier(request);
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

    @PutMapping("/{id}")
    @Operation(summary = "Update supplier by ID")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.updateSupplier(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Supplier updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete supplier by ID")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Supplier deleted successfully"));
    }
}
