package com.example.inventorymanagementsystem.service.impl;

import com.example.inventorymanagementsystem.dto.request.OrderItemRequest;
import com.example.inventorymanagementsystem.dto.request.OrderRequest;
import com.example.inventorymanagementsystem.dto.response.OrderResponse;
import com.example.inventorymanagementsystem.entity.Order;
import com.example.inventorymanagementsystem.entity.OrderItem;
import com.example.inventorymanagementsystem.entity.Product;
import com.example.inventorymanagementsystem.entity.User;
import com.example.inventorymanagementsystem.entity.enums.OrderStatus;
import com.example.inventorymanagementsystem.mapper.OrderItemMapper;
import com.example.inventorymanagementsystem.mapper.OrderMapper;
import com.example.inventorymanagementsystem.entity.StockBatch;
import com.example.inventorymanagementsystem.repository.OrderRepository;
import com.example.inventorymanagementsystem.repository.ProductRepository;
import com.example.inventorymanagementsystem.repository.StockBatchRepository;
import com.example.inventorymanagementsystem.repository.UserRepository;
import com.example.inventorymanagementsystem.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockBatchRepository stockBatchRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;

    @Override
    @Transactional
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

            // FIFO (First-In, First-Out) Inventory Stock Batch Depletion
            deductStockFifo(product, itemRequest.getQuantity());
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
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {

        Order order = orderRepository.findByIdWithDetails(id).orElseThrow(() ->
                new RuntimeException("Order Not Found!")
        );

        /*
         * Cancellation + Restock
         *
         * Only PENDING orders can be cancelled.
         */
        if (status == OrderStatus.CANCELLED) {

            // Prevent cancelling an already cancelled order
            if (order.getStatus() == OrderStatus.CANCELLED) {
                throw new RuntimeException(
                        "Order is already cancelled."
                );
            }

            // Only pending orders can be cancelled
            if (order.getStatus() != OrderStatus.PENDING) {
                throw new RuntimeException(
                        "Only pending orders can be cancelled."
                );
            }

            /*
             * Return each ordered quantity
             * back to the product stock using FIFO restoration.
             */
            for (OrderItem orderItem : order.getOrderItems()) {
                Product product = orderItem.getProduct();
                restoreStockFifo(product, orderItem.getQuantity());
            }
        }

        // Update order status
        order.setStatus(status);

        // Save updated order
        Order updatedOrder = orderRepository.save(order);

        return orderMapper.toResponse(updatedOrder);
    }

    /**
     * FIFO (First-In, First-Out) Stock Batch Depletion.
     * Earliest stocked inventory batches (oldest createdAt) are consumed first.
     */
    private void deductStockFifo(Product product, int quantityToDeduct) {
        List<StockBatch> activeBatches = stockBatchRepository.findActiveBatchesByProductIdFifo(product.getId());

        // Backward compatibility: If product has existing quantity but no batch rows yet, create initial batch
        if (activeBatches.isEmpty() && product.getQuantity() > 0) {
            StockBatch initialBatch = StockBatch.builder()
                    .batchNumber("BATCH-" + product.getId() + "-INIT")
                    .product(product)
                    .initialQuantity(product.getQuantity())
                    .remainingQuantity(product.getQuantity())
                    .costPrice(product.getCostPrice())
                    .createdAt(product.getCreatedAt() != null ? product.getCreatedAt() : LocalDateTime.now())
                    .build();
            stockBatchRepository.save(initialBatch);
            activeBatches = List.of(initialBatch);
        }

        int remainingToDeduct = quantityToDeduct;
        for (StockBatch batch : activeBatches) {
            if (remainingToDeduct <= 0) break;
            if (batch.getRemainingQuantity() <= 0) continue;

            int deductAmount = Math.min(batch.getRemainingQuantity(), remainingToDeduct);
            batch.setRemainingQuantity(batch.getRemainingQuantity() - deductAmount);
            stockBatchRepository.save(batch);
            remainingToDeduct -= deductAmount;
        }

        // Update overall product inventory count
        product.setQuantity(Math.max(0, product.getQuantity() - quantityToDeduct));
        productRepository.save(product);
    }

    /**
     * Restore stock upon order cancellation back to product inventory and batches.
     */
    private void restoreStockFifo(Product product, int quantityToRestore) {
        // Return quantity to product overall stock
        product.setQuantity(product.getQuantity() + quantityToRestore);
        productRepository.save(product);

        // Restore back to FIFO batches
        List<StockBatch> batches = stockBatchRepository.findByProductIdOrderByCreatedAtAsc(product.getId());
        if (!batches.isEmpty()) {
            int remainingToRestore = quantityToRestore;
            for (StockBatch batch : batches) {
                if (remainingToRestore <= 0) break;
                int spaceInBatch = batch.getInitialQuantity() - batch.getRemainingQuantity();
                if (spaceInBatch > 0) {
                    int addBack = Math.min(spaceInBatch, remainingToRestore);
                    batch.setRemainingQuantity(batch.getRemainingQuantity() + addBack);
                    stockBatchRepository.save(batch);
                    remainingToRestore -= addBack;
                }
            }
            if (remainingToRestore > 0) {
                // If all batches are full, replenish the earliest batch
                StockBatch first = batches.get(0);
                first.setRemainingQuantity(first.getRemainingQuantity() + remainingToRestore);
                stockBatchRepository.save(first);
            }
        } else {
            StockBatch restockedBatch = StockBatch.builder()
                    .batchNumber("BATCH-" + product.getId() + "-RESTOCK")
                    .product(product)
                    .initialQuantity(product.getQuantity())
                    .remainingQuantity(product.getQuantity())
                    .costPrice(product.getCostPrice())
                    .createdAt(LocalDateTime.now())
                    .build();
            stockBatchRepository.save(restockedBatch);
        }
    }

    @Override
    public void deleteOrder(Long id) {
        Order order = orderRepository.findByIdWithDetails(id).orElseThrow(() ->
                new RuntimeException("Order Not Found")
                );
        orderRepository.delete(order);
    }
}
