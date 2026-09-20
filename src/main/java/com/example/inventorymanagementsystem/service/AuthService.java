package com.example.inventorymanagementsystem.service;

import com.example.inventorymanagementsystem.dto.request.LoginRequest;
import com.example.inventorymanagementsystem.dto.request.RegisterRequest;
import com.example.inventorymanagementsystem.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
