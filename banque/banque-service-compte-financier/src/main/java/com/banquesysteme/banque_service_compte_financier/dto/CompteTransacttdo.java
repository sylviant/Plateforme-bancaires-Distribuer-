package com.banquesysteme.banque_service_compte_financier.dto;

import lombok.Data;

@Data
public class CompteTransacttdo {
    private String type;
    private double montant;
    private String idCompteSource;
    private String idCompteDestination;
    private String dateCreation;
    public CompteTransacttdo(double montant, String idCompteSource, String idCompteDestination) {
        this.montant = montant;
        this.idCompteSource = idCompteSource;
        this.idCompteDestination = idCompteDestination;
    }

    


    public CompteTransacttdo(String type, double montant, String idCompteSource, String idCompteDestination,
            String dateCreation) {
        this.type = type;
        this.montant = montant;
        this.idCompteSource = idCompteSource;
        this.idCompteDestination = idCompteDestination;
        this.dateCreation = dateCreation;
    }




    public CompteTransacttdo() {
    }

    


    

}
              