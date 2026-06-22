package com.banquesysteme.banque_service_compte_financier.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.banquesysteme.banque_service_compte_financier.model.Compte;
import com.banquesysteme.banque_service_compte_financier.repository.RepoCompteFinancier;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServiceCompte {


    private final RepoCompteFinancier rUserRepository ;
     
    public List<Compte> getAllCompte() {
        return rUserRepository.findAll()
            .stream()
            .map(c -> new Compte(
                c.getIdCompte(),
                c.getNumeroCompte(),
                c.getSolde(),
                c.getIdOperateur(),
                c.getTypeCompte(),
                c.getDevise(),
                c.getIdclient(),
                c.getDate()
            ))
            .toList();
    }

}
