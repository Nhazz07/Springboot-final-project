package com.example.inventorymanagementsystem.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.inventorymanagementsystem.entity.User;
import com.example.inventorymanagementsystem.entity.enums.Role;
import com.example.inventorymanagementsystem.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdminUsers();
    }

    private void seedAdminUsers() {
        List<SeedAccount> accounts = List.of(
                new SeedAccount("mongkol", "thoeungsereymongkol@gmail.com", "123456", Role.ADMIN),
                new SeedAccount("nhazz", "manjirokys@gmail.com", "123456", Role.ADMIN),
                new SeedAccount("admin", "admin@gmail.com", "123456", Role.ADMIN)
        );

        for (SeedAccount acc : accounts) {
            if (!userRepository.existsByUsername(acc.username()) && !userRepository.existsByEmail(acc.email())) {
                User user = User.builder()
                        .username(acc.username())
                        .email(acc.email())
                        .password(passwordEncoder.encode(acc.password()))
                        .role(acc.role())
                        .build();
                userRepository.save(user);
                log.info("Seeded admin account: {} ({}) with password '{}'", acc.username(), acc.email(), acc.password());
            }
        }
    }

    private record SeedAccount(String username, String email, String password, Role role) {

    }
}
