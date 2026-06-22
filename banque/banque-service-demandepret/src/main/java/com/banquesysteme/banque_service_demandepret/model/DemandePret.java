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
    private String idClient;
    private String montantDemande;
    private String statut;
    private String dateEcheance;
    private String montantEcheance;
    private String estPaye;

}