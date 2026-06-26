package com.banquesysteme.banque_service_demandepret.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data 
public class DemandePret {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idPret;
    private Long idClient;
    private float montantDemande;
    private String statut;
    private String dateEcheance;
    private float montantEcheance;
    private String estPaye;

}