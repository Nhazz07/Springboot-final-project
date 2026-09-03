package com.example.inventorymanagementsystem.exception;

//ResourceNotFoundException is used for handling cases where a requested resource is not found in the database.
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    //this used for creating custom exception messages
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }
}
