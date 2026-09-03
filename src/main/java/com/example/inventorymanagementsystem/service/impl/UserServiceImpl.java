package com.example.inventorymanagementsystem.service.impl;

import com.example.inventorymanagementsystem.dto.request.UserRequest;
import com.example.inventorymanagementsystem.dto.response.UserResponse;
import com.example.inventorymanagementsystem.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Override
    public UserResponse createUser(UserRequest request) {
        return null;
    }

    @Override
    public UserResponse getUserById(Long id) {
        return null;
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return List.of();
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest request) {
        return null;
    }

    @Override
    public void deleteUser(Long id) {
    }
}
