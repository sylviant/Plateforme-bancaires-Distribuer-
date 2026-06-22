package com.banquesysteme.banque_service_compte_financier.service;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.banquesysteme.banque_service_compte_financier.model.Compte;
import com.banquesysteme.banque_service_compte_financier.repository.RepoCompteFinancier;

@Component
// J'ai enlevé @RequiredArgsConstructor car l'injection par @Autowired sur le champ ou via constructeur est plus sûre ici
public class CompteListener {

    @Autowired // TRÈS IMPORTANT : Il manquait cette annotation, sinon compteRepository vaut null !
    private RepoCompteFinancier compteRepository;

    // Classe interne pour mapper le JSON entrant
    // 💡 Astuce : Ajoute des Getters/Setters ou rends les champs bien publics (comme tu as fait)
    // public static class UserValidatedPayload {
    //     private Long id;
    //     private String prenom;
    //     private String nom;
    //     private String email;

    //     // Getters / Setters requis par Jackson pour désérialiser proprement le JSON
    //     public String getPrenom() { return prenom; }
    //     public void setPrenom(String prenom) { this.prenom = prenom; }
    //     public String getNom() { return nom; }
    //     public void setNom(String nom) { this.nom = nom; }
    //     public String getEmail() { return email; }
    //     public void setEmail(String email) { this.email = email; }

    //     public Long getId() { return id; }
    //     public void setId(Long id) { this.id = id; }
    // }
    // Classe interne pour mapper le JSON entrant 



    public static class UserValidatedPayload {
        private Long iuser; //  Doit s'appeler iuser (en minuscules) pour correspondre au JSON !
        private String typeCompte;
        private String idOperateur;
        private String nom;
        private String dateNaissance;
        public Long getIuser() {
            return iuser;
        }
        public void setIuser(Long iuser) {
            this.iuser = iuser;
        }
        public String getTypeCompte() {
            return typeCompte;
        }
        public void setTypeCompte(String typeCompte) {
            this.typeCompte = typeCompte;
        }
        public String getIdOperateur() {
            return idOperateur;
        }
        public void setIdOperateur(String idOperateur) {
            this.idOperateur = idOperateur;
        }
        public String getNom() {
            return nom;
        }
        public void setNom(String nom) {
            this.nom = nom;
        }
        public String getDateNaissance() {
            return dateNaissance;
        }
        public void setDateNaissance(String dateNaissance) {
            this.dateNaissance = dateNaissance;
        }

    }

    @RabbitListener(queues = "queue-compte")
    public void handleUserActivation(UserValidatedPayload payload) {
        // Sécurité au cas où le payload arriverait vide
        if (payload == null || payload.getNom() == null) {
            System.err.println("[RABBITMQ] Erreur : Le payload reçu est vide ou incomplet.");
            return;
        }

        System.out.println("[RABBITMQ] Message intercepté pour l'utilisateur : " + payload.getNom());

        try {
            // 1. Initialisation de l'entité de compte bancaire
            Compte nouveauCompte = new Compte();
            String uniqueSuffix = String.valueOf((int)(Math.random() * 89999) + 10000);
            nouveauCompte.setIdclient(payload.getIuser());
            nouveauCompte.setNumeroCompte("CM-ECO-" + payload.getIdOperateur().toUpperCase() + "-" + uniqueSuffix);
            nouveauCompte.setSolde(0.0); // Solde de bienvenue
            nouveauCompte.setIdOperateur(payload.getTypeCompte());
            nouveauCompte.setTypeCompte(payload.getDateNaissance());
            nouveauCompte.setDevise("FCFA");
            nouveauCompte.setDate(payload.getNom());


            // 2. Sauvegarde concrète en base de données
            Compte compteEnregistre = compteRepository.save(nouveauCompte);

            System.out.println("payload.getIuser()"+payload.getIuser());
            System.out.println("payload.getNom()."+payload.getNom());
            System.out.println("payload.getIdOperateur()"+payload.getIdOperateur());
            System.out.println("payload.getIdOperateur()"+payload.getIdOperateur());
            System.out.println("payload.getTypeCompte()."+payload.getTypeCompte());
            System.out.println("payload.getDateNaissance()."+payload.getDateNaissance());
            System.out.println("Compte ID: " + compteEnregistre.getIdCompte() + " | N°: " + compteEnregistre.getNumeroCompte());
            
        } catch (Exception e) {
            System.err.println("[ERREUR BDD            nouveauCompte.setIdCompte(payload.getId());] Impossible de sauvegarder le compte : " + e.getMessage());
            e.printStackTrace();
        }
    }
}



// package com.banquesysteme.banque_service_compte_financier.service;


// import org.springframework.amqp.rabbit.annotation.RabbitListener;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Component;

// import com.banquesysteme.banque_service_compte_financier.model.Compte;
// import com.banquesysteme.banque_service_compte_financier.repository.RepoCompteFinancier;

// import lombok.RequiredArgsConstructor;

// @Component
// @RequiredArgsConstructor
// public class CompteListener {

  
//     private RepoCompteFinancier compteRepository;

//     // Classe interne pour mapper le JSON entrant
//     public static class UserValidatedPayload {
//         public String prenom;
//         public String nom;
//         public String email;
//     }

//     @RabbitListener(queues = "queue-compte")
//     public void handleUserActivation(UserValidatedPayload payload) {
//         System.out.println("[RABBITMQ] Message intercepté pour l'utilisateur : " + payload.nom);

//         // 1. Initialisation de l'entité de compte bancaire
//         Compte nouveauCompte = new Compte();
//         String uniqueSuffix = String.valueOf((int)(Math.random() * 89999) + 10000);
        
//         nouveauCompte.setNumeroCompte("CM-ECO-" + payload.nom.toUpperCase() + "-" + uniqueSuffix);
//         nouveauCompte.setSolde(50000.0); // Solde initial requis
//         nouveauCompte.setIdOperateur(payload.nom);
//         nouveauCompte.setTypeCompte("Orange");
//         nouveauCompte.setDevise("FCFA");
//        // nouveauCompte.setUsernameProprietaire(payload.nom);

//         // 2. Sauvegarde concrète en base de données H2/MySQL
//         Compte compteEnregistre = compteRepository.save(nouveauCompte);

//         System.out.println("[BDD SAVE] Compte persisté avec succès.");
//         System.out.println("Compte ID: " + compteEnregistre.getIdCompte()+ " | N°: " + compteEnregistre.getNumeroCompte());
//     }
// }
