package com.example.inventorymanagementsystem.service;

import com.example.inventorymanagementsystem.dto.request.UserRequest;
import com.example.inventorymanagementsystem.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {

    UserResponse createUser(UserRequest request);

    UserResponse getUserById(Long id);

    UserResponse getProfileByUsername(String username);

    List<UserResponse> getAllUsers();

    UserResponse updateUser(Long id, UserRequest request);

    UserResponse uploadAvatar(Long id, MultipartFile file);

    UserResponse uploadAvatarByUsername(String username, MultipartFile file);

    void deleteUser(Long id);
}
