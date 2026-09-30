package com.example.inventorymanagementsystem.service;

import com.example.inventorymanagementsystem.dto.request.SupplierRequest;
import com.example.inventorymanagementsystem.dto.response.SupplierResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SupplierService {

    SupplierResponse createSupplier(SupplierRequest request);

    SupplierResponse createSupplier(SupplierRequest request, MultipartFile file);

    SupplierResponse getSupplierById(Long id);

    List<SupplierResponse> getAllSuppliers();

    SupplierResponse updateSupplier(Long id, SupplierRequest request);

    SupplierResponse updateSupplier(Long id, SupplierRequest request, MultipartFile file);

    void deleteSupplier(Long id);
}
