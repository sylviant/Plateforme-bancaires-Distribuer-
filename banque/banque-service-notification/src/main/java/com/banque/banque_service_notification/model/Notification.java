package com.banque.banque_service_notification.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data 
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idNotification;
    private String idUtilisateur;
    private String type;
    private String message;
    private String dateEnvoi;

}