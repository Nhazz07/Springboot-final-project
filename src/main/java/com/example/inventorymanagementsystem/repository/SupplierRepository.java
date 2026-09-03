package com.example.inventorymanagementsystem.repository;

import com.example.inventorymanagementsystem.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT s FROM Supplier s LEFT JOIN FETCH s.products WHERE s.id = :id")
    Optional<Supplier> findByIdWithProducts(@Param("id") Long id);
}
