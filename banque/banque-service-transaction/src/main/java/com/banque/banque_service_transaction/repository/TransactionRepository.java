package com.banque.banque_service_transaction.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.banque.banque_service_transaction.model.Transaction;


// @RestResource(path = "clients")
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer>{

}