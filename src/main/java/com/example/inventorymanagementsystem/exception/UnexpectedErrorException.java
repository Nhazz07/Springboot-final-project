package com.example.inventorymanagementsystem.exception;

//UnexpectedErrorException is used for handling unexpected errors that occur during the application execution.
public class UnexpectedErrorException extends RuntimeException {

    //this is used for creating custom exception messages
    public UnexpectedErrorException(String message) {
        super(message);
    }

    public UnexpectedErrorException(String message, Throwable cause) {
        super(message, cause);
    }
}
