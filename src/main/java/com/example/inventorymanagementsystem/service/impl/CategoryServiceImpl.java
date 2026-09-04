package com.example.inventorymanagementsystem.service.impl;

import com.example.inventorymanagementsystem.dto.request.CategoryRequest;
import com.example.inventorymanagementsystem.dto.response.CategoryResponse;
import com.example.inventorymanagementsystem.entity.Category;
import com.example.inventorymanagementsystem.exception.BadRequestException;
import com.example.inventorymanagementsystem.exception.ResourceNotFoundException;
import com.example.inventorymanagementsystem.mapper.CategoryMapper;
import com.example.inventorymanagementsystem.repository.CategoryRepository;
import com.example.inventorymanagementsystem.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String name = request.getName().trim();
        if (categoryRepository.existsByName(name)) {
            throw new BadRequestException("Category with name '" + name + "' already exists");
        }

        Category category = CategoryMapper.toEntity(request);
        category.setName(name);
        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        String name = request.getName().trim();
        if (!category.getName().equalsIgnoreCase(name) && categoryRepository.existsByName(name)) {
            throw new BadRequestException("Category with name '" + name + "' already exists");
        }

        category.setName(name);
        category.setDescription(request.getDescription());
        Category updated = categoryRepository.save(category);
        return categoryMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            throw new BadRequestException("Cannot delete category with id '" + id + "' because it has associated products");
        }

        categoryRepository.delete(category);
    }
}

