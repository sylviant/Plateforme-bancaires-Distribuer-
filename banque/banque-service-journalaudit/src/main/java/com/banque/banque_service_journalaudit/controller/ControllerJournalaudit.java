//package com.bankingsystem.bank_user_service.controller;
package com.banque.banque_service_journalaudit.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ControllerJournalaudit {

    @GetMapping("/")
    public String home() {
        return "Service Journalaudit démarré avec succès !";
    }

    @GetMapping("/us")
    public String ping() {
        return "pong";
    }

    @GetMapping("/testtransaction")
    public String test() {
        return "Le microservice fonctionne correctement user !";
    }
}
