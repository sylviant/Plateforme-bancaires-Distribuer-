package com.banque.banque_service_journalaudit.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data 
public class Journalaudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idLog;
    private String idActeur;
    private String action;
    private String timestamp;
}