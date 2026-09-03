package com.example.inventorymanagementsystem.service;

import com.example.inventorymanagementsystem.dto.request.CategoryRequest;
import com.example.inventorymanagementsystem.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse getCategoryById(Long id);

    List<CategoryResponse> getAllCategories();

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);
}
