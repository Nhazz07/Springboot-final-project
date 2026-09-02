package com.example.inventorymanagementsystem.Service.Impl;

import com.example.inventorymanagementsystem.Dtos.RequstDtos.SupplierRequestDto;
import com.example.inventorymanagementsystem.Dtos.ResponseDtos.SupplierResponseDto;
import com.example.inventorymanagementsystem.Service.SupplierService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierServiceImpl implements SupplierService {
    @Override
    public SupplierResponseDto createSupplier(SupplierRequestDto dto) {
        return null;
    }

    @Override
    public SupplierResponseDto getSupplierById(Long id) {
        return null;
    }

    @Override
    public List<SupplierResponseDto> getAllSupplier() {
        return List.of();
    }

    @Override
    public SupplierResponseDto updateSupplier(Long id, SupplierRequestDto dto) {
        return null;
    }

    @Override
    public void deleteSupplier(Long id) {

    }
}
