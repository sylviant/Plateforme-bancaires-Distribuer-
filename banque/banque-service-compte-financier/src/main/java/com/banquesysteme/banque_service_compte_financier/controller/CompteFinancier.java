package com.banquesysteme.banque_service_compte_financier.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CompteFinancier {

    @GetMapping("/compte")
    public String home() {
        return "Service CompteFinancier démarré avec succès !";
    }

    @GetMapping("/pingcompte")
    public String ping() {
        return "pong";
    }

    @GetMapping("/testcompte")
    public String test() {
        return "Le microservice fonctionne correctement CompteFinancier !";
    }
}
