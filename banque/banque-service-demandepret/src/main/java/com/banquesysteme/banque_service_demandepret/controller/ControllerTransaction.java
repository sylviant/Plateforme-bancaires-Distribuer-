//package com.bankingsystem.bank_user_service.controller;
package com.banquesysteme.banque_service_demandepret.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ControllerTransaction {

    @GetMapping("/de")
    public String home() {
        return "Service user démarré avec succès !";
    }

    @GetMapping("/use")
    public String ping() {
        return "pong";
    }

    @GetMapping("/testtransaction")
    public String test() {
        return "Le microservice fonctionne correctement user !";
    }
}
