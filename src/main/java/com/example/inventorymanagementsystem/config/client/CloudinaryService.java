package com.example.inventorymanagementsystem.config.client;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.inventorymanagementsystem.exception.BadRequestException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folder:etec_springboot_final_project}")
    private String defaultFolder;

    @Value("${cloudinary.folder-product:etec_springboot_final_project/etec_springboot_final_project_product}")
    private String productFolder;

    @Value("${cloudinary.folder-profile:etec_springboot_final_project/etec_springboot_final_project_profile}")
    private String profileFolder;

    @Value("${cloudinary.folder-supplier:etec_springboot_final_project/etec_springboot_final_project_supplier}")
    private String supplierFolder;

    public Map<?, ?> uploadFile(MultipartFile file, String folderName) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty or missing.");
        }
        String targetFolder = (folderName != null && !folderName.isBlank()) ? folderName : defaultFolder;
        try {
            log.info("Uploading file to Cloudinary folder: {}", targetFolder);
            return cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", targetFolder,
                            "asset_folder", targetFolder,
                            "use_asset_folder_as_public_id_prefix", true,
                            "resource_type", "auto"
                    )
            );
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary folder {}: {}", targetFolder, e.getMessage());
            throw new BadRequestException("Failed to upload image to Cloudinary: " + e.getMessage());
        }
    }

    public Map<?, ?> uploadImage(MultipartFile file) {
        return uploadFile(file, defaultFolder);
    }

    public Map<?, ?> uploadProductImage(MultipartFile file) {
        return uploadFile(file, productFolder);
    }

    public Map<?, ?> uploadProfileImage(MultipartFile file) {
        return uploadFile(file, profileFolder);
    }

    public Map<?, ?> uploadSupplierImage(MultipartFile file) {
        return uploadFile(file, supplierFolder);
    }

    public String extractPublicId(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank() || !imageUrl.contains("cloudinary.com")) {
            return null;
        }
        try {
            int uploadIndex = imageUrl.indexOf("/upload/");
            if (uploadIndex == -1) {
                return null;
            }
            String path = imageUrl.substring(uploadIndex + "/upload/".length());

            String[] segments = path.split("/");
            int startIndex = 0;
            for (int i = 0; i < segments.length; i++) {
                if (segments[i].matches("^v\\d+$")) {
                    startIndex = i + 1;
                    break;
                }
            }

            StringBuilder publicIdBuilder = new StringBuilder();
            for (int i = startIndex; i < segments.length; i++) {
                if (!publicIdBuilder.isEmpty()) {
                    publicIdBuilder.append("/");
                }
                publicIdBuilder.append(segments[i]);
            }
            String publicIdWithExt = publicIdBuilder.toString();

            int queryIdx = publicIdWithExt.indexOf('?');
            if (queryIdx != -1) {
                publicIdWithExt = publicIdWithExt.substring(0, queryIdx);
            }

            int lastDot = publicIdWithExt.lastIndexOf('.');
            if (lastDot != -1) {
                return publicIdWithExt.substring(0, lastDot);
            }
            return publicIdWithExt;
        } catch (Exception e) {
            log.warn("Failed to extract public_id from Cloudinary URL '{}': {}", imageUrl, e.getMessage());
            return null;
        }
    }

    public Map<?, ?> deleteFile(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            return Map.of();
        }
        try {
            log.info("Deleting image from Cloudinary with publicId: {}", publicId);
            return cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("invalidate", true));
        } catch (IOException | RuntimeException e) {
            log.warn("Failed to delete image from Cloudinary for publicId '{}': {}", publicId, e.getMessage());
            return Map.of();
        }
    }

    public Map<?, ?> deleteImage(String publicId) {
        return deleteFile(publicId);
    }

    public void deleteImageByUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        String publicId = extractPublicId(imageUrl);
        if (publicId != null && !publicId.isBlank()) {
            deleteFile(publicId);
        }
    }
}
