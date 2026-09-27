package com.example.inventorymanagementsystem.controller;

import com.example.inventorymanagementsystem.dto.request.UserRequest;
import com.example.inventorymanagementsystem.dto.response.ApiResponse;
import com.example.inventorymanagementsystem.dto.response.UserResponse;
import com.example.inventorymanagementsystem.service.UserService;
import com.example.inventorymanagementsystem.service.impl.UserServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Validated
@Tag(name = "users", description = "Endpoint for user ")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request){
        UserResponse userResponse = userService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(userResponse, "User created successfully"));
    }
    @GetMapping("/{id}")
    @Operation(summary = "Get a user by id")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByOd(@PathVariable @Positive Long id){
        UserResponse userResponse = userService.getUserById(id);

        return ResponseEntity.ok(ApiResponse.success(userResponse, "User retrieved successfully"));
    }
    @GetMapping
    @Operation(summary = "Get all user")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUser(){
        List<UserResponse> userResponseList = userService.getAllUsers();

        return ResponseEntity.ok(ApiResponse.success(userResponseList, "All user retrieved successfully"));
    }
    @PutMapping("/{id}")
    @Operation(summary = "Update user by id")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserById(@PathVariable @Positive Long id, @Valid @RequestBody UserRequest request){
        UserResponse userResponse = userService.updateUser(id,request);

        return ResponseEntity.ok(ApiResponse.success(userResponse, "User updated successfully"));
    }
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user by id")
    public ResponseEntity<ApiResponse<Void>> deleteUserById(@PathVariable @Positive Long id){
        userService.deleteUser(id);

        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }
}
