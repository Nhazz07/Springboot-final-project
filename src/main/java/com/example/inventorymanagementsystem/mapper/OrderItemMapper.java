package com.example.inventorymanagementsystem.mapper;

import com.example.inventorymanagementsystem.dto.request.OrderItemRequest;
import com.example.inventorymanagementsystem.dto.response.OrderItemResponse;
import com.example.inventorymanagementsystem.entity.Order;
import com.example.inventorymanagementsystem.entity.OrderItem;
import com.example.inventorymanagementsystem.entity.Product;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OrderItemMapper {

    public OrderItem toEntity(
            OrderItemRequest request,
            Order order,
            Product product
    ) {
        OrderItem orderItem = new OrderItem();

        // Product
        orderItem.setProduct(product);

        // IMPORTANT:
        // Link this order item to its order
        orderItem.setOrder(order);

        // Quantity comes from the customer's request
        orderItem.setQuantity(request.getQuantity());

        // Price comes from the database, not the frontend
        orderItem.setUnitPrice(product.getPrice());

        // Calculate subtotal
        BigDecimal subtotal = product.getPrice()
                .multiply(
                        BigDecimal.valueOf(
                                request.getQuantity()
                        )
                );

        orderItem.setSubtotal(subtotal);

        return orderItem;
    }

    public OrderItemResponse toResponse(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();

        response.setId(orderItem.getId());

        response.setProductId(
                orderItem.getProduct().getId()
        );

        response.setProductName(
                orderItem.getProduct().getName()
        );

        response.setQuantity(
                orderItem.getQuantity()
        );

        response.setUnitPrice(
                orderItem.getUnitPrice()
        );

        response.setSubtotal(
                orderItem.getUnitPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        orderItem.getQuantity()
                                )
                        )
        );

        response.setCreatedAt(
                orderItem.getCreatedAt()
        );

        response.setUpdatedAt(
                orderItem.getUpdatedAt()
        );

        return response;
    }
}