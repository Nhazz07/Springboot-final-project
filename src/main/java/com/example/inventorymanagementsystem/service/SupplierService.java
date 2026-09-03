package com.example.inventorymanagementsystem.service;

import com.example.inventorymanagementsystem.dto.request.SupplierRequest;
import com.example.inventorymanagementsystem.dto.response.SupplierResponse;

import java.util.List;

public interface SupplierService {

    SupplierResponse createSupplier(SupplierRequest request);

    SupplierResponse getSupplierById(Long id);

    List<SupplierResponse> getAllSuppliers();

    SupplierResponse updateSupplier(Long id, SupplierRequest request);

    void deleteSupplier(Long id);
}
