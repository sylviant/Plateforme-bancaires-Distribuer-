//package com.bankingsystem.bank_user_service.controller;
package com.banque.banque_service_notification.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ControllerNotification {

    @GetMapping("/Notification")
    public String home() {
        return "Service Notification démarré avec succès !";
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
