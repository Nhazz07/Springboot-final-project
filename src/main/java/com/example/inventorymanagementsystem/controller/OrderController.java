package com.example.inventorymanagementsystem.controller;

import com.example.inventorymanagementsystem.dto.request.OrderRequest;
import com.example.inventorymanagementsystem.dto.response.ApiResponse;
import com.example.inventorymanagementsystem.dto.response.OrderResponse;
import com.example.inventorymanagementsystem.entity.enums.OrderStatus;
import com.example.inventorymanagementsystem.service.OrderService;
import com.example.inventorymanagementsystem.service.impl.OrderServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create an order")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request){
        OrderResponse orderResponse = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(orderResponse, "Order created successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by id")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable @Positive Long id){
        OrderResponse orderResponse = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(orderResponse, "Order retrieved successfully"));

    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Get order by order number")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByOrderNumber(@PathVariable String orderNumber){
        OrderResponse orderResponse = orderService.getOrderByOrderNumber(orderNumber);

        return ResponseEntity.ok(ApiResponse.success(orderResponse, "Order retrieved successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all order")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrder(){
        List<OrderResponse> orderResponseList = orderService.getAllOrders();

        return ResponseEntity.ok(ApiResponse.success(orderResponseList, "All order retrieved successfully"));
    }

    @GetMapping("/user/userId")
    @Operation(summary = "Get order by user id")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrderUserId( @PathVariable @Positive Long userId){
        List<OrderResponse> orderResponseList = orderService.getOrdersByUserId(userId);

        return ResponseEntity.ok(ApiResponse.success(orderResponseList, "Order retrieved successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update order by id")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderById( @PathVariable @Positive Long id, @RequestParam OrderStatus status){
        OrderResponse orderResponse = orderService.updateOrderStatus(id, status);

        return ResponseEntity.ok(ApiResponse.success(orderResponse, "Order updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete order by id")
    public ResponseEntity<ApiResponse<OrderResponse>> deleteOrderById( @PathVariable @Positive Long id){
        orderService.deleteOrder(id);

        return ResponseEntity.ok(ApiResponse.success(null, "Order deleted successfully"));
    }
}
