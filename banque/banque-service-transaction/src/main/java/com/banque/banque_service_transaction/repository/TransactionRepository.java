package com.banque.banque_service_transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.banque.banque_service_transaction.model.Transaction;
import java.util.List;



// @RestResource(path = "clients")
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer>{
    List<Transaction> findByIdCompteSource(String idCompteSource);
}