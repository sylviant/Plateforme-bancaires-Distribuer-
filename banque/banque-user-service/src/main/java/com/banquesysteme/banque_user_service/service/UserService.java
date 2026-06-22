package com.banquesysteme.banque_user_service.service;

import com.banquesysteme.banque_user_service.BanqueUserServiceApplication;
import com.banquesysteme.banque_user_service.config.UserRabbitConfig;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.banquesysteme.banque_user_service.dto.Connexion;
import com.banquesysteme.banque_user_service.dto.UserDto;
import com.banquesysteme.banque_user_service.model.User;
import com.banquesysteme.banque_user_service.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final BanqueUserServiceApplication banqueUserServiceApplication;
    private final UserRepository rUserRepository ;
  
    @Autowired // <-- IL MANQUE SÛREMENT CETTE ANNOTATION ICI !
    private RabbitTemplate rabbitTemplate;

    // UserService(BanqueUserServiceApplication banqueUserServiceApplication) {
    //     this.banqueUserServiceApplication = banqueUserServiceApplication;
    // }
    
    public List<User> getAllUser() {
    return rUserRepository.findAll()
            .stream()
            .map(c -> new User(
                c.getIUser(),
                c.getNom(),
                c.getPrenom(),
                c.getMotDePasseChiffre(),
                c.getRole(),
                c.getDateCreation(),
                c.getEmail(),
                c.getDateNaissance(),
                c.getStatus()
            ))
            .toList();
    }

    public User getUserValider(Long id, String status) {
           User user = rUserRepository.findById(id).get();
           user.setStatus("Approuve");
            // System.out.println("Utilisateur validé localement : " + user.getNom());
            // // 2. Préparation du message pour le bus AMQP
            // UserDto event = new UserDto(user.getIUser(), user.getNom(),user.getPrenom(), user.getEmail());
            // // 3. Envoi dans RabbitMQ
            // System.out.println("++++id+++ " + user.getIUser());
            // rabbitTemplate.convertAndSend(
            //     UserRabbitConfig.EXCHANGE_NAME, 
            //     UserRabbitConfig.ROUTING_KEY, 
            //     event
            // );
            // System.out.println("Événement 'user.validated' publié dans RabbitMQ pour " + user.getNom());
        return rUserRepository.save(user);
           //  .orElseThrow(() -> new ExceptionManager("Hospital unfound", HttpStatus.NOT_FOUND));
    }
    public User getUserRejeter(Long id) {
        User user = rUserRepository.findById(id).get();
        user.setStatus("REJETE");

        UserDto event = new UserDto(user.getIUser(),user.getDateCreation());
        // 3. Envoi dans RabbitMQ
        System.out.println("++++id+++ " + user.getIUser());
        rabbitTemplate.convertAndSend(
            UserRabbitConfig.EXCHANGE_NAME, 
            UserRabbitConfig.ROUTING_KEY, 
            event
        );


       return rUserRepository.save(user);
           //  .orElseThrow(() -> new ExceptionManager("Hospital unfound", HttpStatus.NOT_FOUND));
    }


    @Transactional
    public User createUser(UserDto dto) {
        // LocalDate aujourdhui = LocalDate.now();
        // DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        // String dateFormatee = aujourdhui.format(formatter);
        String anneeString = String.valueOf(LocalDate.now().getYear());
        User user = new User();
        user.setIUser(dto.getIUser());
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setMotDePasseChiffre(dto.getMotDePasseChiffre());
        user.setRole(dto.getRole());
        user.setEmail(dto.getEmail());
        user.setDateCreation(anneeString);
        user.setDateNaissance(dto.getDateNaissance());
        user.setStatus(dto.getStatus());
        user = rUserRepository.save(user);
//envoyer producer pour creer compte
        UserDto event = new UserDto(user.getIUser(), dto.getTypeCompte(),dto.getIdOperateur(),dto.getNom(),anneeString);
        // 3. Envoi dans RabbitMQ
        System.out.println("++++id+++ " + user.getIUser());
        rabbitTemplate.convertAndSend(
            UserRabbitConfig.EXCHANGE_NAME, 
            UserRabbitConfig.ROUTING_KEY, 
            event
        );

        return user;
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!rUserRepository.existsById(id)) {
           // throw new ExceptionManager("Country not found", HttpStatus.NOT_FOUND);
        }
        rUserRepository.deleteById(id);
    }

    @Transactional
    public User updateUser(Long id, UserDto dto) {
            LocalDate aujourdhui = LocalDate.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String dateFormatee = aujourdhui.format(formatter);
            User user = new User();
            user.setIUser(dto.getIUser());
            user.setNom(dto.getNom());
            user.setPrenom(dto.getPrenom());
            user.setMotDePasseChiffre(dto.getMotDePasseChiffre());
            user.setRole(dto.getRole());
            user.setEmail(dto.getEmail());
            user.setDateCreation(dateFormatee);
            user.setDateNaissance(dto.getDateNaissance());
            user.setStatus(dto.getStatus());
        return rUserRepository.save(user);
    }


    public User connexion(Connexion connexion) {
         System.out.print(connexion+"---connexion avant---"+connexion);
        List<User> user = rUserRepository.findAll();
        for(User user2:user){
            System.out.print(user2.getMotDePasseChiffre()+"---connexion---"+user2.getNom());
            if (user2.getNom().equals(connexion.getUsername()) && user2.getMotDePasseChiffre().equals(connexion.getPassword())) {
                System.out.print("---connexion bien---"+user2.getNom());
                  return user2;
            }
        }return null;
    }


}







