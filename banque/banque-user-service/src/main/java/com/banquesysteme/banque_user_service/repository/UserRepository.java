package com.banquesysteme.banque_user_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import com.banquesysteme.banque_user_service.model.User;


// @RestResource(path = "clients")
//@Repository
@RestResource(path = "users")
//@RestResource(path = "clients")
public interface UserRepository extends JpaRepository<User, Long>{

}