package com.banquesysteme.banque_service_compte_financier.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.banquesysteme.banque_service_compte_financier.dto.CompteTransacttdo;
import com.banquesysteme.banque_service_compte_financier.model.Compte;
import com.banquesysteme.banque_service_compte_financier.repository.RepoCompteFinancier;
//import com.banquesysteme.banque_user_service.config.UserRabbitConfig;
import com.banquesysteme.banque_service_compte_financier.config.ProducerCompTransactRabbitConfig;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServiceCompte {


    private final RepoCompteFinancier rUserRepository ;
    @Autowired // <-- IL MANQUE SÛREMENT CETTE ANNOTATION ICI !
    private RabbitTemplate rabbitTemplate;
     
    public List<Compte> getAllCompte() {
        return rUserRepository.findAll()
            .stream()
            .map(c -> new Compte(
                c.getIdCompte(),
                c.getNumeroCompte(),
                c.getSolde(),
                c.getIdOperateur(),
                c.getTypeCompte(),
                c.getDevise(),
                c.getIdclient(),
                c.getDate()
            ))
            .toList();
    }

    @Transactional
    public void deleteCompte(Long idclient) {
        // Récupérer le compte du client
        Compte compte = rUserRepository.findByIdclient(idclient);
        
        if (compte == null) {
            throw new RuntimeException("Client ou compte non trouvé avec l'ID: " + idclient);
        }
        
        // Supprimer le compte
        rUserRepository.deleteById(compte.getIdCompte());
    }

  //  @Transactional
    public void validerTransaction(CompteTransacttdo compteTransacttdo) {
        // Récupérer le compte du client
        double soldeDes = 0;
        double soldeSou = 0;
        Compte compteDestinateur = rUserRepository.findByNumeroCompte(compteTransacttdo.getIdCompteDestination());
        Compte compteresource = rUserRepository.findByNumeroCompte(compteTransacttdo.getIdCompteSource());
         
        soldeSou = compteresource.getSolde() - compteTransacttdo.getMontant();
        soldeDes = compteDestinateur.getSolde() + compteTransacttdo.getMontant();
        compteDestinateur.setSolde(soldeDes);
        compteresource.setSolde(soldeSou);
        rUserRepository.save(compteDestinateur);
        rUserRepository.save(compteresource);



        LocalDate aujourdhui = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String dateFormatee = aujourdhui.format(formatter);
        CompteTransacttdo event = new CompteTransacttdo(compteresource.getTypeCompte() , compteTransacttdo.getMontant(), compteTransacttdo.getIdCompteSource(),compteTransacttdo.getIdCompteDestination(),
             dateFormatee);
        // 3. Envoi dans RabbitMQ
        System.out.println("++++id rabt transation +++ " + compteTransacttdo.getMontant());
        rabbitTemplate.convertAndSend(
            ProducerCompTransactRabbitConfig.EXCHANGE_NAME, 
            ProducerCompTransactRabbitConfig.ROUTING_KEY, 
            event
        );
       
    }



    @Transactional
    public Compte getCompte(Long idclient) {
        // Récupérer le compte du client
        Compte compte = rUserRepository.findByIdclient(idclient);
        
        if (compte == null) {
            throw new RuntimeException("Client ou compte non trouvé avec l'ID: " + idclient);
        }
        return compte;
        // Supprimer le compte
       // rUserRepository.deleteById(compte.getIdCompte());
    }




}
