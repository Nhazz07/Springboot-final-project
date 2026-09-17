package com.example.inventorymanagementsystem.service.impl;

import com.example.inventorymanagementsystem.dto.request.OrderItemRequest;
import com.example.inventorymanagementsystem.dto.request.OrderRequest;
import com.example.inventorymanagementsystem.dto.response.OrderItemResponse;
import com.example.inventorymanagementsystem.dto.response.OrderResponse;
import com.example.inventorymanagementsystem.entity.Order;
import com.example.inventorymanagementsystem.entity.OrderItem;
import com.example.inventorymanagementsystem.entity.Product;
import com.example.inventorymanagementsystem.entity.User;
import com.example.inventorymanagementsystem.entity.enums.OrderStatus;
import com.example.inventorymanagementsystem.mapper.OrderItemMapper;
import com.example.inventorymanagementsystem.mapper.OrderMapper;
import com.example.inventorymanagementsystem.repository.OrderRepository;
import com.example.inventorymanagementsystem.repository.ProductRepository;
import com.example.inventorymanagementsystem.repository.UserRepository;
import com.example.inventorymanagementsystem.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;

    @Override
    @Transactional(readOnly = true)
    public OrderResponse createOrder(OrderRequest request) {
        User user = userRepository.findById(request.getUserId()).orElseThrow(() ->
                new RuntimeException("User Not Found"));

        Order order = OrderMapper.toEntity(request,user);

        order.setOrderNumber("ORD- " + UUID.randomUUID()
                .toString()
                .substring(0,8)
                .toUpperCase()
        );
        order.setStatus(OrderStatus.PENDING);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for(OrderItemRequest itemRequest : request.getItems()){
            Product product = productRepository.findById(itemRequest.getProductId()).orElseThrow(() ->
                    new RuntimeException("Product Not Found")
                    );
            if(product.getQuantity() < itemRequest.getQuantity()){
                throw new RuntimeException(
                        "Not Enough Stock for product: " + product.getName()
                );
            }
            BigDecimal subtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            OrderItem orderItem = orderItemMapper.toEntity(
                    itemRequest,
                    order,
                    product
            );
            order.getOrderItems().add(orderItem);

            totalAmount = totalAmount.add(subtotal);

            product.setQuantity(
                    product.getQuantity() - itemRequest.getQuantity()
            );
            productRepository.save(product);
        }
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        return orderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Order Not Found!")
                );
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumberWithDetails(orderNumber).orElseThrow(() ->
                new RuntimeException("Order Not Found")
                );
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllWithDetails()
                .stream()
                .map(orderMapper :: toResponse)
                .toList()
                ;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdWithDetails(userId)
                .stream()
                .map(orderMapper::toResponse)
                .toList()
                ;
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findByIdWithDetails(id).orElseThrow(() ->
                new RuntimeException("Order Not Found!")
                );
        order.setStatus(status);

        Order updatedOrder = orderRepository.save(order);

        return orderMapper.toResponse(updatedOrder);
    }

    @Override
    public void deleteOrder(Long id) {
        Order order = orderRepository.findByIdWithDetails(id).orElseThrow(() ->
                new RuntimeException("Order Not Found")
                );
        orderRepository.delete(order);
    }
}
