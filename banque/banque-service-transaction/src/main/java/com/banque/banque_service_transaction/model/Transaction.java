package com.banque.banque_service_transaction.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data 
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idTransaction;
    private String type;
    private double montant;
    private String idCompteSource;
    private String idCompteDestination;
    private String dateCreation;

}