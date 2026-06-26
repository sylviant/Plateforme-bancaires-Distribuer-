//package com.bankingsystem.bank_user_service.controller;
package com.banquesysteme.banque_service_demandepret.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.banquesysteme.banque_service_demandepret.dto.Pretdto;
import com.banquesysteme.banque_service_demandepret.model.DemandePret;
import com.banquesysteme.banque_service_demandepret.servicepret.Servicepret;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ControllerTransaction {
   // @Autowired

    private final Servicepret sUserService;

    @GetMapping
    public ResponseEntity<List<DemandePret>> getPretAll() {
        return ResponseEntity.ok(sUserService.getAllDemandePrets());
    }

    @PostMapping
    public ResponseEntity<DemandePret> createDemndepret(@RequestBody Pretdto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sUserService.createDemandePret(dto));
    }
//rejeter compter
    @PutMapping("rejeter/{id}")
    public ResponseEntity<DemandePret> getUserById(@PathVariable int id) {
        return ResponseEntity.ok(sUserService.getpreRejetter(id));
    }

    @PutMapping("valider/{id}")
    public ResponseEntity<DemandePret> updateUservalider(@PathVariable int id, String statut) {
        return ResponseEntity.ok(sUserService.getpretValider(id, statut));
        
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletepret(@PathVariable int id) {
        sUserService.deletepret(id);
        return ResponseEntity.noContent().build();
    }

}
