package com.example.inventorymanagementsystem.repository;

import com.example.inventorymanagementsystem.entity.StockBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockBatchRepository extends JpaRepository<StockBatch, Long> {

    @Query("SELECT b FROM StockBatch b WHERE b.product.id = :productId AND b.remainingQuantity > 0 ORDER BY b.createdAt ASC, b.id ASC")
    List<StockBatch> findActiveBatchesByProductIdFifo(@Param("productId") Long productId);

    List<StockBatch> findByProductIdOrderByCreatedAtAsc(Long productId);

    @Query("SELECT b FROM StockBatch b WHERE b.product.id = :productId ORDER BY b.createdAt DESC, b.id DESC")
    List<StockBatch> findBatchesByProductIdDesc(@Param("productId") Long productId);
}
