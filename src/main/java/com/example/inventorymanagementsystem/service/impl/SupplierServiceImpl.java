package com.example.inventorymanagementsystem.service.impl;

import com.example.inventorymanagementsystem.dto.request.SupplierRequest;
import com.example.inventorymanagementsystem.dto.response.SupplierResponse;
import com.example.inventorymanagementsystem.entity.Supplier;
import com.example.inventorymanagementsystem.exception.BadRequestException;
import com.example.inventorymanagementsystem.exception.ResourceNotFoundException;
import com.example.inventorymanagementsystem.mapper.SupplierMapper;
import com.example.inventorymanagementsystem.repository.SupplierRepository;
import com.example.inventorymanagementsystem.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Override
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        String name = request.getName().trim();
        if (supplierRepository.existsByName(name)) {
            throw new BadRequestException("Supplier with name '" + name + "' already exists");
        }

        Supplier supplier = supplierMapper.toEntity(request);
        supplier.setName(name);
        Supplier saved = supplierRepository.save(supplier);
        return supplierMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(supplierMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        String name = request.getName().trim();
        if (!supplier.getName().equalsIgnoreCase(name) && supplierRepository.existsByName(name)) {
            throw new BadRequestException("Supplier with name '" + name + "' already exists");
        }

        supplier.setName(name);
        supplier.setContactName(request.getContactName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());

        Supplier updated = supplierRepository.save(supplier);
        return supplierMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        if (supplier.getProducts() != null && !supplier.getProducts().isEmpty()) {
            throw new BadRequestException("Cannot delete supplier with id '" + id + "' because it has associated products");
        }

        supplierRepository.delete(supplier);
    }
}

