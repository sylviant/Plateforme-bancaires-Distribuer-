package com.banque.banque_service_transaction.servicetransaction;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.banque.banque_service_transaction.model.Transaction;
import com.banque.banque_service_transaction.repository.TransactionRepository;
//import com.banquesysteme.banque_service_compte_financier.model.Compte;
//import com.banquesysteme.banque_service_compte_financier.repository.RepoCompteFinancier;

@Component
// J'ai enlevé @RequiredArgsConstructor car l'injection par @Autowired sur le champ ou via constructeur est plus sûre ici
public class TransactListener {

    @Autowired // TRÈS IMPORTANT : Il manquait cette annotation, sinon compteRepository vaut null !
    private TransactionRepository transactionRepository;

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



    public static class transactionValidatedPayload {
            private String type;
            private double montant;
            private String idCompteSource;
            private String idCompteDestination;
            private String dateCreation;

            public String getType() {
                return type;
            }
            public void setType(String type) {
                this.type = type;
            }
            public double getMontant() {
                return montant;
            }
            public void setMontant(double montant) {
                this.montant = montant;
            }
            public String getIdCompteSource() {
                return idCompteSource;
            }
            public void setIdCompteSource(String idCompteSource) {
                this.idCompteSource = idCompteSource;
            }
            public String getIdCompteDestination() {
                return idCompteDestination;
            }
            public void setIdCompteDestination(String idCompteDestination) {
                this.idCompteDestination = idCompteDestination;
            }
            public String getDateCreation() {
                return dateCreation;
            }
            public void setDateCreation(String dateCreation) {
                this.dateCreation = dateCreation;
            }
        

    }

    @RabbitListener(queues = "queue-transaction")
    public void handleUserActivation(transactionValidatedPayload payload) {
        // Sécurité au cas où le payload arriverait vide
        if (payload == null || payload.getIdCompteDestination() == null) {
            System.err.println("[RABBITMQ] Erreur : Le payload reçu est vide ou incomplet.");
            return;
        }

        System.out.println("[RABBITMQ] Message intercepté pour transaction : " + payload.getIdCompteDestination());

        try {
            // 1. Initialisation de l'entité de compte bancaire
            Transaction nouveautTransaction = new Transaction();
            
            nouveautTransaction.setType(payload.getType());
            nouveautTransaction.setIdCompteSource(payload.getIdCompteSource());
            nouveautTransaction.setIdCompteDestination(payload.getIdCompteDestination());
            nouveautTransaction.setDateCreation(payload.getDateCreation());
            nouveautTransaction.setMontant(payload.getMontant());



            // 2. Sauvegarde concrète en base de données
            Transaction compteEnregistre = transactionRepository.save(nouveautTransaction);

            System.out.println("+++ payload.getMontant());+++" +payload.getMontant());

            
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
