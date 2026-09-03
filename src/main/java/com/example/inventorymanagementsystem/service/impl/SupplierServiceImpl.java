package com.example.inventorymanagementsystem.service.impl;

import com.example.inventorymanagementsystem.dto.request.SupplierRequest;
import com.example.inventorymanagementsystem.dto.response.SupplierResponse;
import com.example.inventorymanagementsystem.service.SupplierService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierServiceImpl implements SupplierService {

    @Override
    public SupplierResponse createSupplier(SupplierRequest request) {
        return null;
    }

    @Override
    public SupplierResponse getSupplierById(Long id) {
        return null;
    }

    @Override
    public List<SupplierResponse> getAllSuppliers() {
        return List.of();
    }

    @Override
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        return null;
    }

    @Override
    public void deleteSupplier(Long id) {
    }
}
