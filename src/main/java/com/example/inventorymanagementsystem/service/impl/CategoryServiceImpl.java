package com.example.inventorymanagementsystem.service.impl;

import com.example.inventorymanagementsystem.dto.request.CategoryRequest;
import com.example.inventorymanagementsystem.dto.response.CategoryResponse;
import com.example.inventorymanagementsystem.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        return null;
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        return null;
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return List.of();
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        return null;
    }

    @Override
    public void deleteCategory(Long id) {
    }
}
