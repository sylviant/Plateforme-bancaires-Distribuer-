
package com.banquesysteme.banque_service_compte_financier.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;
import lombok.Data;

import org.springframework.data.domain.Persistable;

@Entity
@Data
public class Compte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // MySQL va gérer tout seul
    private Long idCompte; 
    
    private String numeroCompte;
    private Double solde;
    private String idOperateur;
    private String typeCompte;
    private String devise;
    private Long idclient;
    private String date;

    // Pas besoin de Persistable, pas besoin de isNew, pas besoin de surcharger getId()
}


// package com.banquesysteme.banque_service_compte_financier.model;

// import jakarta.persistence.Entity;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import lombok.Data;

// @Entity
// @Data
// public class Compte {
//     @Id
//     // @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long idCompte;
//     private String numeroCompte;
//     private double solde;
//     private String devise;
//     private String idOperateur;
//     private String typeCompte;
// }
