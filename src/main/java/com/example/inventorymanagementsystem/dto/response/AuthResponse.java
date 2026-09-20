package com.example.inventorymanagementsystem.dto.response;

import com.example.inventorymanagementsystem.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private Long expiresIn;

    private Long userId;

    private String username;

    private String email;

    private Role role;
}
