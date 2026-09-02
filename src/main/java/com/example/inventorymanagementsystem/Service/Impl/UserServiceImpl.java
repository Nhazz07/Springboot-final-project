package com.example.inventorymanagementsystem.Service.Impl;

import com.example.inventorymanagementsystem.Dtos.RequstDtos.UserRequestDto;
import com.example.inventorymanagementsystem.Dtos.ResponseDtos.UserResponseDto;
import com.example.inventorymanagementsystem.Service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    @Override
    public UserResponseDto createUser(UserRequestDto dto) {
        return null;
    }

    @Override
    public UserResponseDto getUserById(Long id) {
        return null;
    }

    @Override
    public List<UserResponseDto> getAllUser() {
        return List.of();
    }

    @Override
    public UserResponseDto updateUser(Long id, UserRequestDto dto) {
        return null;
    }

    @Override
    public void deleteUser(Long id) {

    }
}
