package com.example.inventorymanagementsystem.Service;

import com.example.inventorymanagementsystem.Dtos.RequstDtos.CategoryRequestDto;
import com.example.inventorymanagementsystem.Dtos.ResponseDtos.CategoryResponseDto;

import java.util.List;

public interface CategoryService {
    CategoryResponseDto createCategory(CategoryRequestDto dto);
    CategoryResponseDto getCategoryById(Long id);
    List<CategoryResponseDto> getAllCategory();
    CategoryResponseDto updateCategory(Long id, CategoryRequestDto dto);
    void deleteCategory(Long id);
}
