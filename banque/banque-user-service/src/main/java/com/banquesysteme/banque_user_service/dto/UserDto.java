package com.banquesysteme.banque_user_service.dto;


import java.io.Serializable;

import lombok.Data;

@Data
public class UserDto implements Serializable {

    private Long iUser;
    private String nom;
    private String prenom;
    private String motDePasseChiffre;
    private String role;
    private String email;
    private String dateNaissance;
    private String status;
    private String typeCompte;
    private String idOperateur;
    



    public UserDto(Long iUser, String nom, String prenom, String motDePasseChiffre, String role,
            String email, String dateNaissance, String status) {
        this.iUser = iUser;
        this.nom = nom;
        this.prenom = prenom;
        this.motDePasseChiffre = motDePasseChiffre;
        this.role = role;
        this.email = email;
        this.dateNaissance = dateNaissance;
        this.status = status;
    }

    

    

    public UserDto(Long iUser, String dateNaissance, String typeCompte, String idOperateur, String nom) {
        this.iUser = iUser;
        this.typeCompte = typeCompte;
        this.idOperateur = idOperateur;
        this.nom = nom;
        this.dateNaissance = dateNaissance;
    }

    public UserDto(Long iUser, String dateNaissance) {
        this.iUser = iUser;
        this.dateNaissance = dateNaissance;
    }

    // public UserDto(Long iUser, String nom, String prenom, String email, String dateNaissance, String status) {
    //     this.iUser = iUser;
    //     this.nom = nom;
    //     this.prenom = prenom;
    //     this.email = email;
    //     this.dateNaissance = dateNaissance;
    //     this.status = status;
    // }

    public UserDto() {
    }

    

    

}
