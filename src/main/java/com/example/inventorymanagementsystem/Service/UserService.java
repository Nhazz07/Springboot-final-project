package com.example.inventorymanagementsystem.Service;

import com.example.inventorymanagementsystem.Dtos.RequstDtos.UserRequestDto;
import com.example.inventorymanagementsystem.Dtos.ResponseDtos.UserResponseDto;

import java.util.List;

public interface UserService {
    UserResponseDto createUser(UserRequestDto dto);
    UserResponseDto getUserById(Long id);
    List<UserResponseDto> getAllUser();
    UserResponseDto updateUser(Long id, UserRequestDto dto);
    void deleteUser(Long id);
}
