//package com.bankingsystem.bank_user_service.controller;
package com.banque.banque_service_analysedocument.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ControllerAnalyseDocument {

    @GetMapping("/a")
    public String home() {
        return "Service AnalyseDocument démarré avec succès !";
    }

    @GetMapping("/a2")
    public String ping() {
        return "pong";
    }

    @GetMapping("/t")
    public String test() {
        return "Le microservice fonctionne correctement transaction !";
    }
}
