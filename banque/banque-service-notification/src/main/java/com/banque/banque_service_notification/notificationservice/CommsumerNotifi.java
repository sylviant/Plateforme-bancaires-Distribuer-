
package com.banque.banque_service_notification.notificationservice;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Component;
import com.banque.banque_service_notification.model.Notification;
import com.banque.banque_service_notification.repository.NotificationRepository;


import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.*;


import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Date;

@Component
public class CommsumerNotifi {

    @Autowired
	JavaMailSender javaMailSender;

    @Autowired 
    private NotificationRepository notificationRepository; // Renommé pour correspondre au domaine Notification

    // Classe interne parfaitement structurée pour Jackson
    public static class UserValidatedPayload {
        private Long iuser; 
        private String typeCompte;
        private String idOperateur;
        private String nom;
        private String dateNaissance;
        private String status; // Ajouté au cas où tu passes le statut depuis User

        public Long getIuser() { return iuser; }
        public void setIuser(Long iuser) { this.iuser = iuser; }
        public String getTypeCompte() { return typeCompte; }
        public void setTypeCompte(String typeCompte) { this.typeCompte = typeCompte; }
        public String getIdOperateur() { return idOperateur; }
        public void setIdOperateur(String idOperateur) { this.idOperateur = idOperateur; }
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        public String getDateNaissance() { return dateNaissance; }
        public void setDateNaissance(String dateNaissance) { this.dateNaissance = dateNaissance; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    @RabbitListener(queues = "queue-notification") // ✅ Écoute la queue de notification !
    public void handleUserActivation(UserValidatedPayload payload) {
        
        if (payload == null || payload.getNom() == null) {
            System.err.println("[NOTIFICATION] Erreur : Le payload reçu est vide.");
            return;
        }

        System.out.println("[NOTIFICATION] Événement reçu pour l'utilisateur : " + payload.getNom());

        try {
            // Logique de création de la notification
            if (payload.getDateNaissance().equals("EPARGNE") || payload.getDateNaissance().equals("COURANT")) {
            }
            else{
                Notification nouvelleNotification = new Notification();
                LocalDate aujourdhui = LocalDate.now();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                String dateFormatee = aujourdhui.format(formatter);
                
                // Adapte ces setters selon les vrais champs de ton entité Notification
                nouvelleNotification.setIdUtilisateur(payload.getIuser());
                nouvelleNotification.setMessage("Bonjour " + payload.getNom() + ", votre profil a été traité avec succès.");
                nouvelleNotification.setDateEnvoi(dateFormatee); // Date du jour de traitement
                nouvelleNotification.setType(payload.getNom());
                // Sauvegarde concrète dans la base de données de Notification
                Notification notifSauvegardee = notificationRepository.save(nouvelleNotification);


                if (payload.getNom().equals("Approuve")) {
                    sendmail(payload.getIdOperateur(),payload.getDateNaissance(), payload.getTypeCompte());
                    
                } if (payload.getNom().equals("REJETE")) {
                    sendmailRejetter(payload.getIdOperateur(),payload.getDateNaissance(), payload.getTypeCompte());
                }
            }
            // Affichages de débogage
            System.out.println("--- Détails du payload reçu ---");
            System.out.println("User ID : " + payload.getIuser());
            System.out.println("Nom : " + payload.getNom());
            System.out.println("Type  payload.getTypeCompte() : " + payload.getTypeCompte());
            System.out.println("User payload.getDateNaissance() : " + payload.getDateNaissance());
            System.out.println("payload.getIdOperateur() email : " + payload.getIdOperateur());
            System.out.println("Type payload.getStatus() : " + payload.getStatus());
            
        } catch (Exception e) {
            System.err.println("[ERROR NOTIFICATION] Échec de la sauvegarde : " + e.getMessage());
            e.printStackTrace();
        }

    }
    private void sendmail(String emailToRecipient, String nom , String prenom) {
		final String emailSubject = "Votre compte bancaire a été ouvert avec succès";
		final String message ="Bonjour  "+ nom +" "+ prenom+
               " Nous avons le plaisir de vous informer que votre compte bancaire a été ouvert avec succès."+
               "Nous restons à votre disposition pour toute question."+
              "Cordialement, MISKINE KALTANE";
		
		javaMailSender.send(new MimeMessagePreparator() {

			@Override
			public void prepare(MimeMessage mimeMessage) throws Exception {
				// TODO Auto-generated method stub
				MimeMessageHelper Helper=new MimeMessageHelper(mimeMessage, true, "UTF-8");
				Helper.setTo(emailToRecipient);
				Helper.setText(message, true);
				Helper.setSubject(emailSubject);
				
				
			}
			
		});
		
		
	}

        private void sendmailRejetter(String emailToRecipient, String nom , String prenom) {
		final String emailSubject = "Votre compte bancaire n'a pas été ouvert";
		final String message ="Bonjour  "+ nom +" "+ prenom+
               " Nous avons le plaisir de vous informer que votre compte bancaire n'a pas été  ouvert"+
               "Nous restons à votre disposition pour toute question."+
              "Cordialement, MISKINE KALTANE";
		
		javaMailSender.send(new MimeMessagePreparator() {

			@Override
			public void prepare(MimeMessage mimeMessage) throws Exception {
				// TODO Auto-generated method stub
				MimeMessageHelper Helper=new MimeMessageHelper(mimeMessage, true, "UTF-8");
				Helper.setTo(emailToRecipient);
				Helper.setText(message, true);
				Helper.setSubject(emailSubject);
				
				
			}
			
		});
		
		
	}


}

// package com.banque.banque_service_notification.notificationservice;



// import org.springframework.amqp.rabbit.annotation.RabbitListener;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Component;
// // import com.banquesysteme.banque_service_compte_financier.model.Compte;
// // import com.banquesysteme.banque_service_compte_financier.repository.RepoCompteFinancier;
// // import com.banquesysteme.banque_service_compte_financier.service.CompteListener.UserValidatedPayload;
// //import com.banquesysteme.banque_service_compte_financier.service.CompteListener.UserDto;

// import com.banque.banque_service_notification.model.Notification;
// import com.banque.banque_service_notification.repository.NotificationRepository;

// @Component
// // J'ai enlevé @RequiredArgsConstructor car l'injection par @Autowired sur le champ ou via constructeur est plus sûre ici
// public class CommsumerNotifi {

//     @Autowired // TRÈS IMPORTANT : Il manquait cette annotation, sinon compteRepository vaut null !
//     private NotificationRepository compteRepository;

//     // Classe interne pour mapper le JSON entrant
//     // 💡 Astuce : Ajoute des Getters/Setters ou rends les champs bien publics (comme tu as fait)
//     // public static class UserValidatedPayload {
//     //     private Long id;
//     //     private String prenom;
//     //     private String nom;
//     //     private String email;

//     //     // Getters / Setters requis par Jackson pour désérialiser proprement le JSON
//     //     public String getPrenom() { return prenom; }
//     //     public void setPrenom(String prenom) { this.prenom = prenom; }
//     //     public String getNom() { return nom; }
//     //     public void setNom(String nom) { this.nom = nom; }
//     //     public String getEmail() { return email; }
//     //     public void setEmail(String email) { this.email = email; }

//     //     public Long getId() { return id; }
//     //     public void setId(Long id) { this.id = id; }
//     // }
//     // Classe interne pour mapper le JSON entrant 



//     public static class UserValidatedPayload {
//         private Long iuser; //  Doit s'appeler iuser (en minuscules) pour correspondre au JSON !
//         private String typeCompte;
//         private String idOperateur;
//         private String nom;
//         private String dateNaissance;
//         public Long getIuser() {
//             return iuser;
//         }
//         public void setIuser(Long iuser) {
//             this.iuser = iuser;
//         }
//         public String getTypeCompte() {
//             return typeCompte;
//         }
//         public void setTypeCompte(String typeCompte) {
//             this.typeCompte = typeCompte;
//         }
//         public String getIdOperateur() {
//             return idOperateur;
//         }
//         public void setIdOperateur(String idOperateur) {
//             this.idOperateur = idOperateur;
//         }
//         public String getNom() {
//             return nom;
//         }
//         public void setNom(String nom) {
//             this.nom = nom;
//         }
//         public String getDateNaissance() {
//             return dateNaissance;
//         }
//         public void setDateNaissance(String dateNaissance) {
//             this.dateNaissance = dateNaissance;
//         }

//     }

//     @RabbitListener(queues = "queue-compte")
//     public void handleUserActivation(UserValidatedPayload payload) {
//         // Sécurité au cas où le payload arriverait vide
//         if (payload == null || payload.getNom() == null) {
//             System.err.println("[RABBITMQ] Erreur : Le payload reçu est vide ou incomplet.");
//             return;
//         }

//         System.out.println("[RABBITMQ] Message intercepté pour l'utilisateur : " + payload.getNom());

//         try {
//             // 1. Initialisation de l'entité de compte bancaire

//             if (!payload.getDateNaissance().equals("EPARGNE") || !payload.getDateNaissance().equals("COURANT")) {
//                     Notification nouveauNotification = new Notification();
//                     //String uniqueSuffix = String.valueOf((int)(Math.random() * 89999) + 10000);
//                     // nouveauCompte.setIdclient(payload.getIuser());
//                     // nouveauCompte.setNumeroCompte("CM-ECO-" + payload.getIdOperateur().toUpperCase() + "-" + uniqueSuffix);
//                     // nouveauCompte.setSolde(5000.0); // Solde de bienvenue
//                     // nouveauCompte.setIdOperateur(payload.getTypeCompte());
//                     // nouveauCompte.setTypeCompte(payload.getDateNaissance());
//                     // nouveauCompte.setDevise("FCFA");
//                     // nouveauCompte.setDate(payload.getNom());
//                    // nouveauNotification.setDateEnvoi(payload.);



//                     // 2. Sauvegarde concrète en base de données
//                    // Compte compteEnregistre = compteRepository.save(nouveauCompte);
//             }


//             System.out.println("payload.getIuser()"+payload.getIuser());
//             System.out.println("payload.getNom()."+payload.getNom());
//             System.out.println("payload.getIdOperateur()"+payload.getIdOperateur());
//             System.out.println("payload.getIdOperateur()"+payload.getIdOperateur());
//             System.out.println("payload.getTypeCompte()."+payload.getTypeCompte());
//             System.out.println("payload.getDateNaissance()."+payload.getDateNaissance());
//           //  System.out.println("Compte ID: " + compteEnregistre.getIdCompte() + " | N°: " + compteEnregistre.getNumeroCompte());
            
//         } catch (Exception e) {
//             System.err.println("[ERREUR BDD            nouveauCompte.setIdCompte(payload.getId());] Impossible de sauvegarder le compte : " + e.getMessage());
//             e.printStackTrace();
//         }
//     }
// }
