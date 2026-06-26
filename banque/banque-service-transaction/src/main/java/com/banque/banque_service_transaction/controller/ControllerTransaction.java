//package com.bankingsystem.bank_user_service.controller;
package com.banque.banque_service_transaction.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.banque.banque_service_transaction.model.Transaction;
import com.banque.banque_service_transaction.servicetransaction.Servicetransaction;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ControllerTransaction {

    private final Servicetransaction sUserService;

    @GetMapping("/{id}")
    public List<Transaction> getUserById(@PathVariable String id) {
        System.out.print("++controleuuur++"+id);
        return sUserService.getAllTransactions(id);
    }

    // @GetMapping("/{id}")
    // public ResponseEntity<Transaction> updateUser(@PathVariable String id) {
    //     return ResponseEntity.ok(sUserService.getAllTransactions(id));
    // }


}


