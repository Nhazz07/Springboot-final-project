package com.example.inventorymanagementsystem;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.cloudinary.Cloudinary;
import com.example.inventorymanagementsystem.config.client.CloudinaryService;

class CloudinaryServiceTest {

    private CloudinaryService cloudinaryService;

    @BeforeEach
    void setUp() {
        Cloudinary cloudinary = Mockito.mock(Cloudinary.class);
        cloudinaryService = new CloudinaryService(cloudinary);
    }

    @Test
    void testExtractPublicId_standardProductUrl() {
        String url = "https://res.cloudinary.com/dnuqw4ctr/image/upload/v1726839201/etec_springboot_final_project/etec_springboot_final_project_product/abc123xyz.jpg";
        String publicId = cloudinaryService.extractPublicId(url);
        assertEquals("etec_springboot_final_project/etec_springboot_final_project_product/abc123xyz", publicId);
    }

    @Test
    void testExtractPublicId_profileUrlWithTransformations() {
        String url = "https://res.cloudinary.com/dnuqw4ctr/image/upload/c_fill,w_300/v1726839201/etec_springboot_final_project/etec_springboot_final_project_profile/avatar1.png";
        String publicId = cloudinaryService.extractPublicId(url);
        assertEquals("etec_springboot_final_project/etec_springboot_final_project_profile/avatar1", publicId);
    }

    @Test
    void testExtractPublicId_noVersion() {
        String url = "https://res.cloudinary.com/dnuqw4ctr/image/upload/etec_springboot_final_project/etec_springboot_final_project_product/sample.webp";
        String publicId = cloudinaryService.extractPublicId(url);
        assertEquals("etec_springboot_final_project/etec_springboot_final_project_product/sample", publicId);
    }

    @Test
    void testExtractPublicId_rootImage() {
        String url = "https://res.cloudinary.com/dnuqw4ctr/image/upload/v12345/sample_pic.jpeg";
        String publicId = cloudinaryService.extractPublicId(url);
        assertEquals("sample_pic", publicId);
    }

    @Test
    void testExtractPublicId_withQueryParams() {
        String url = "https://res.cloudinary.com/dnuqw4ctr/image/upload/v12345/etec_springboot_final_project/etec_springboot_final_project_product/prod1.jpg?_a=DAJAUVW0";
        String publicId = cloudinaryService.extractPublicId(url);
        assertEquals("etec_springboot_final_project/etec_springboot_final_project_product/prod1", publicId);
    }

    @Test
    void testExtractPublicId_nonCloudinaryUrl() {
        String url = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c";
        String publicId = cloudinaryService.extractPublicId(url);
        assertNull(publicId);
    }

    @Test
    void testExtractPublicId_nullOrBlank() {
        assertNull(cloudinaryService.extractPublicId(null));
        assertNull(cloudinaryService.extractPublicId("   "));
    }
}
