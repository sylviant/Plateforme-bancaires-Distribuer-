package com.banquesysteme.banque_service_compte_financier.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import com.banquesysteme.banque_service_compte_financier.dto.CompteTransacttdo;
import com.banquesysteme.banque_service_compte_financier.model.Compte;
import com.banquesysteme.banque_service_compte_financier.service.ServiceCompte;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/compte")
@RequiredArgsConstructor
public class CompteFinancier {
    private final ServiceCompte sUserService;

    @GetMapping
    public ResponseEntity<List<Compte>> getUser() {
        return ResponseEntity.ok(sUserService.getAllCompte());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        System.out.print("++++supression de iddd___"+id);
        sUserService.deleteCompte(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Compte> updateUser(@PathVariable Long id) {
        return ResponseEntity.ok(sUserService.getCompte(id));
    }

    @PostMapping
    public void validerTransat(@RequestBody CompteTransacttdo dto) {
        System.out.print("++++CompteTransacttdo de iddd___"+dto.getMontant());
        
        sUserService.validerTransaction(dto);
    }

   
}

// @RestController
// @RequestMapping("/api")
// @RequiredArgsConstructor
// public class ControllerUser {

//     private final UserService sUserService;

//     @GetMapping
//     public ResponseEntity<List<User>> getUser() {
//         return ResponseEntity.ok(sUserService.getAllUser());
//     }
// //rejeter compter
//     @PutMapping("rejeter/{id}")
//     public ResponseEntity<User> getUserById(@PathVariable Long id) {
//         return ResponseEntity.ok(sUserService.getUserRejeter(id));
//     }

//     @PutMapping("valider/{id}")
//     public ResponseEntity<User> updateUservalider(@PathVariable Long id, String statut) {
//         return ResponseEntity.ok(sUserService.getUserValider(id, statut));
        
//     }
 
//     @PostMapping
//     public ResponseEntity<User> createUser(@RequestBody UserDto dto) {
//         return ResponseEntity.status(HttpStatus.CREATED).body(sUserService.createUser(dto));
//     }

//     @PutMapping("/{id}")
//     public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserDto dto) {
//         return ResponseEntity.ok(sUserService.updateUser(id, dto));
        
//     }

//     @DeleteMapping("/{id}")
//     public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
//         sUserService.deleteUser(id);
//         return ResponseEntity.noContent().build();
//     }


//     @PostMapping("/login")
//     public ResponseEntity<User> connecter(@RequestBody Connexion connexion) {
//         System.out.print("controler connexion "+connexion);
//         return ResponseEntity.ok(sUserService.connexion(connexion));
//     }
// }

