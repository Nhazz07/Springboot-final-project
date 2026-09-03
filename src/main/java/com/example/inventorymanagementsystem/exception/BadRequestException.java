package com.example.inventorymanagementsystem.exception;

//BadRequestException used for handling bad requests from clients, such as invalid input data, invalid request format, etc.
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
