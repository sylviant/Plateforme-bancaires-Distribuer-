package com.banque.banque_service_journalaudit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import com.banque.banque_service_journalaudit.model.Journalaudit;




// @RestResource(path = "clients")
@Repository
public interface JournalauditRepository extends JpaRepository<Journalaudit, Integer>{

}