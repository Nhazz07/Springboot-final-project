package com.example.inventorymanagementsystem.Service.Impl;

import com.example.inventorymanagementsystem.Dtos.RequstDtos.CategoryRequestDto;
import com.example.inventorymanagementsystem.Dtos.ResponseDtos.CategoryResponseDto;
import com.example.inventorymanagementsystem.Service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {
    @Override
    public CategoryResponseDto createCategory(CategoryRequestDto dto) {
        return null;
    }

    @Override
    public CategoryResponseDto getCategoryById(Long id) {
        return null;
    }

    @Override
    public List<CategoryResponseDto> getAllCategory() {
        return List.of();
    }

    @Override
    public CategoryResponseDto updateCategory(Long id, CategoryRequestDto dto) {
        return null;
    }

    @Override
    public void deleteCategory(Long id) {

    }
}
