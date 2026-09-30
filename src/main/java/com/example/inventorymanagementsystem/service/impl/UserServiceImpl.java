package com.example.inventorymanagementsystem.service.impl;

import com.example.inventorymanagementsystem.config.client.CloudinaryService;
import com.example.inventorymanagementsystem.dto.request.UserRequest;
import com.example.inventorymanagementsystem.dto.response.UserResponse;
import com.example.inventorymanagementsystem.entity.User;
import com.example.inventorymanagementsystem.entity.enums.Role;
import com.example.inventorymanagementsystem.exception.BadRequestException;
import com.example.inventorymanagementsystem.exception.ResourceNotFoundException;
import com.example.inventorymanagementsystem.mapper.UserMapper;
import com.example.inventorymanagementsystem.repository.UserRepository;
import com.example.inventorymanagementsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' is already registered");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required for new accounts");
        }
        if (request.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfileByUsername(String username) {
        User user = userRepository.findByUsername(username.trim())
                .or(() -> userRepository.findByEmail(username.trim().toLowerCase()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("User not found with id: " + id));

        if (!user.getUsername().equalsIgnoreCase(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken");
        }
        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' is already registered");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse uploadAvatar(Long id, MultipartFile file) {
        User user = userRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("User not found with id: " + id));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Profile picture file cannot be empty");
        }

        String oldImageUrl = user.getImageUrl();
        Map<?, ?> uploadResult = cloudinaryService.uploadProfileImage(file);
        String secureUrl = (String) uploadResult.get("secure_url");
        user.setImageUrl(secureUrl);
        User updated = userRepository.save(user);

        if (oldImageUrl != null && !oldImageUrl.isBlank()) {
            cloudinaryService.deleteImageByUrl(oldImageUrl);
        }

        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse uploadAvatarByUsername(String username, MultipartFile file) {
        User user = userRepository.findByUsername(username.trim())
                .or(() -> userRepository.findByEmail(username.trim().toLowerCase()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Profile picture file cannot be empty");
        }

        String oldImageUrl = user.getImageUrl();
        Map<?, ?> uploadResult = cloudinaryService.uploadProfileImage(file);
        String secureUrl = (String) uploadResult.get("secure_url");
        user.setImageUrl(secureUrl);
        User updated = userRepository.save(user);

        if (oldImageUrl != null && !oldImageUrl.isBlank()) {
            cloudinaryService.deleteImageByUrl(oldImageUrl);
        }

        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException("User not found with id: " + id));
        String oldImageUrl = user.getImageUrl();
        userRepository.delete(user);

        if (oldImageUrl != null && !oldImageUrl.isBlank()) {
            cloudinaryService.deleteImageByUrl(oldImageUrl);
        }
    }
}
