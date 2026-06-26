package com.banque.banque_service_transaction.servicetransaction;

import java.util.List;

import org.springframework.stereotype.Service;

import com.banque.banque_service_transaction.model.Transaction;
import com.banque.banque_service_transaction.repository.TransactionRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class Servicetransaction {
    private final TransactionRepository transactionRepository ;

    @Transactional
    public List<Transaction> getAllTransactions(String id) {
        System.out.print("++controleuuur++"+id);
        return transactionRepository.findByIdCompteSource(id);
    }
    

    //     public List<Compte> getAllCompte() {
    // return rUserRepository.findAll()
    //     .stream()
    //     .map(c -> new Compte(
    //         c.getIdCompte(),
    //         c.getNumeroCompte(),
    //         c.getSolde(),
    //         c.getIdOperateur(),
    //         c.getTypeCompte(),
    //         c.getDevise(),
    //         c.getIdclient(),
    //         c.getDate()
    //     ))
    //     .toList();
    // }

}
