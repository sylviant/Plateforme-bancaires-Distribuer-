package com.banquesysteme.banque_user_service.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data 
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long iUser;
    private String nom;
    private String prenom;
    private String motDePasseChiffre;
    private String role;
    private String dateCreation;
    private String email;
    private String dateNaissance;
    private String status;



    public User(Long iUser, String nom, String prenom, String motDePasseChiffre, String role, String dateCreation,
            String email, String dateNaissance, String status) {
        this.iUser = iUser;
        this.nom = nom;
        this.prenom = prenom;
        this.motDePasseChiffre = motDePasseChiffre;
        this.role = role;
        this.dateCreation = dateCreation;
        this.email = email;
        this.dateNaissance = dateNaissance;
        this.status = status;
    }

    public User() {
    }

    

}