//package com.bankingsystem.bank_user_service.controller;
package com.banquesysteme.banque_user_service.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import com.banquesysteme.banque_user_service.dto.Connexion;
import com.banquesysteme.banque_user_service.dto.UserDto;
import com.banquesysteme.banque_user_service.model.User;
import com.banquesysteme.banque_user_service.service.UserService;

import lombok.RequiredArgsConstructor;


// @RestController
// @RequestMapping("/api")
//  @CrossOrigin(origins = "*")

//@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ControllerUser {

    private final UserService sUserService;

    @GetMapping
    public ResponseEntity<List<User>> getUser() {
        return ResponseEntity.ok(sUserService.getAllUser());
    }
//rejeter compter
    @PutMapping("rejeter/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(sUserService.getUserRejeter(id));
    }

    @PutMapping("valider/{id}")
    public ResponseEntity<User> updateUservalider(@PathVariable Long id, String statut) {
        return ResponseEntity.ok(sUserService.getUserValider(id, statut));
        
    }
 
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody UserDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sUserService.createUser(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserDto dto) {
        return ResponseEntity.ok(sUserService.updateUser(id, dto));
        
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        sUserService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/login")
    public ResponseEntity<User> connecter(@RequestBody Connexion connexion) {
        System.out.print("controler connexion "+connexion);
        return ResponseEntity.ok(sUserService.connexion(connexion));
    }
}
