package com.example.inventorymanagementsystem.config.client;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.inventorymanagementsystem.exception.BadRequestException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    private static final String DEFAULT_FOLDER = "ETEC_SpringBoot04_Cloudinary";

    public Map<?, ?> uploadFile(MultipartFile file, String folderName) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty or missing.");
        }
        try {
            return cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", folderName, "resource_type", "auto")
            );
        } catch (IOException e) {//IOException used for file and network errors. In this case is Network error when connect to Cloudinary.
            throw new BadRequestException("Failed to upload image to Cloudinary: " + e.getMessage());
        }
    }

    public Map<?, ?> uploadImage(MultipartFile file) {
        return uploadFile(file, DEFAULT_FOLDER);
    }

    public Map<?, ?> uploadFile(MultipartFile file) {
        return uploadFile(file, DEFAULT_FOLDER);
    }

    public Map<?, ?> deleteFile(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            return Map.of();
        }
        try {
            return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new BadRequestException("Failed to delete image from Cloudinary: " + e.getMessage());
        }
    }

    public Map<?, ?> deleteImage(String publicId) {
        return deleteFile(publicId);
    }
}
