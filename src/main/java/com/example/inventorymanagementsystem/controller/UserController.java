package com.example.inventorymanagementsystem.controller;

import com.example.inventorymanagementsystem.dto.request.UserRequest;
import com.example.inventorymanagementsystem.dto.response.ApiResponse;
import com.example.inventorymanagementsystem.dto.response.UserResponse;
import com.example.inventorymanagementsystem.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Validated
@Tag(name = "users", description = "Endpoints for managing users and profiles")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
        UserResponse userResponse = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(userResponse, "User created successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a user by id")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable @Positive Long id) {
        UserResponse userResponse = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(userResponse, "User retrieved successfully"));
    }

    @GetMapping("/profile/{username}")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == #username")
    @Operation(summary = "Get user profile details by username")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@PathVariable String username) {
        UserResponse userResponse = userService.getProfileByUsername(username);
        return ResponseEntity.ok(ApiResponse.success(userResponse, "User profile retrieved successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> userResponseList = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(userResponseList, "All users retrieved successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user by id")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserById(
            @PathVariable @Positive Long id,
            @Valid @RequestBody UserRequest request) {
        UserResponse userResponse = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(userResponse, "User updated successfully"));
    }

    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload user profile avatar image to Cloudinary by user ID")
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(
            @PathVariable @Positive Long id,
            @RequestParam("file") MultipartFile file) {
        UserResponse userResponse = userService.uploadAvatar(id, file);
        return ResponseEntity.ok(ApiResponse.success(userResponse, "Profile photo updated successfully"));
    }

    @PostMapping(value = "/profile/{username}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or authentication.name == #username")
    @Operation(summary = "Upload user profile avatar image to Cloudinary by username")
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatarByUsername(
            @PathVariable String username,
            @RequestParam("file") MultipartFile file) {
        UserResponse userResponse = userService.uploadAvatarByUsername(username, file);
        return ResponseEntity.ok(ApiResponse.success(userResponse, "Profile photo updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user by id")
    public ResponseEntity<ApiResponse<Void>> deleteUserById(@PathVariable @Positive Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }
}
