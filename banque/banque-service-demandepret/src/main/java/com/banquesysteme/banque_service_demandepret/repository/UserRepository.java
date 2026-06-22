package com.banquesysteme.banque_service_demandepret.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.banquesysteme.banque_service_demandepret.model.DemandePret;



// @RestResource(path = "clients")
@Repository
public interface UserRepository extends JpaRepository<DemandePret, Integer>{

}