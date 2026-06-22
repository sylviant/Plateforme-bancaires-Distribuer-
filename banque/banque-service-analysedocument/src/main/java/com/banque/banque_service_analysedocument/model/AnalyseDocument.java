package com.banque.banque_service_analysedocument.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data 
public class AnalyseDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idAnalyse;
    private String typeDocument;
    private double texteExtrait;
    private String donneesStructurees;
    private String scoreConfiance;
}