package com.example.inventorymanagementsystem.Service;

import com.example.inventorymanagementsystem.Dtos.RequstDtos.SupplierRequestDto;
import com.example.inventorymanagementsystem.Dtos.ResponseDtos.SupplierResponseDto;

import java.util.List;

public interface SupplierService {

    SupplierResponseDto createSupplier(SupplierRequestDto dto);
    SupplierResponseDto getSupplierById(Long id);
    List<SupplierResponseDto> getAllSupplier();
    SupplierResponseDto updateSupplier(Long id, SupplierRequestDto dto);
    void deleteSupplier(Long id);
}
