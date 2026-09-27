package com.example.inventorymanagementsystem.controller;

import com.example.inventorymanagementsystem.dto.request.UserRequest;
import com.example.inventorymanagementsystem.dto.response.ApiResponse;
import com.example.inventorymanagementsystem.dto.response.UserResponse;
import com.example.inventorymanagementsystem.service.impl.UserServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "users", description = "Endpoint for user ")
public class UserController {

    private final UserServiceImpl userServiceImpl;

    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request){
        UserResponse userResponse = userServiceImpl.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(userResponse, "User created successfully"));
    }
    @GetMapping("/{id}")
    @Operation(summary = "Get a user by id")
    public ResponseEntity<ApiResponse<UserResponse>> getUseByOd(@Valid @Positive Long id){
        UserResponse userResponse = userServiceImpl.getUserById(id);

        return ResponseEntity.ok(ApiResponse.success(userResponse, "User retrieved successfully"));
    }
    @GetMapping
    @Operation(summary = "Get all user")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUser(){
        List<UserResponse> userResponseList = userServiceImpl.getAllUsers();

        return ResponseEntity.ok(ApiResponse.success(userResponseList, "All user retrieved successfully"));
    }
    @PutMapping("/{id}")
    @Operation(summary = "Update user by id")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserById(@Valid @Positive Long id, @Valid @RequestBody UserRequest request){
        UserResponse userResponse = userServiceImpl.updateUser(id,request);

        return ResponseEntity.ok(ApiResponse.success(userResponse, "User updated successfully"));
    }
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user by id")
    public ResponseEntity<ApiResponse<Void>> deleteUserById(@Valid @Positive Long id){
        userServiceImpl.deleteUser(id);

        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }
}
