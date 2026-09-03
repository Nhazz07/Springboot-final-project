package com.example.inventorymanagementsystem.mapper;

import com.example.inventorymanagementsystem.dto.request.UserRequest;
import com.example.inventorymanagementsystem.dto.response.UserResponse;
import com.example.inventorymanagementsystem.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserRequest request) {
        return null;
    }

    public UserResponse toResponse(User user) {
        return null;
    }
}
