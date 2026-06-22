//package com.bankingsystem.bank_user_service.controller;
package com.banque.banque_service_transaction.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ControllerTransaction {

    @GetMapping("/transaction1")
    public String home() {
        return "Service transaction démarré avec succès !";
    }

    @GetMapping("/pingtransaction")
    public String ping() {
        return "pong";
    }

    @GetMapping("/testtransaction")
    public String test() {
        return "Le microservice fonctionne correctement transaction !";
    }
}
