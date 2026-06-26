package com.banquesysteme.banque_service_demandepret.dto;

import lombok.Data;

@Data
public class Pretdto {
    private Long id_client1;
    private float montantDemande;
    private int duree;


    public Pretdto(Long id_client1, float montantDemande, int duree) {
        this.id_client1 = id_client1;
        this.montantDemande = montantDemande;
        this.duree = duree;
    }


    public Pretdto() {
    }
}
