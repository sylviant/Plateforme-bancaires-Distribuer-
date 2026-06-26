package com.banquesysteme.banque_service_compte_financier.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.banquesysteme.banque_service_compte_financier.model.Compte;
import java.util.List;



// @RestResource(path = "clients")
@Repository
public interface RepoCompteFinancier extends JpaRepository<Compte, Long>{
    Compte findByIdclient(Long idclient);
    Compte findByNumeroCompte(String numeroCompte);
}

