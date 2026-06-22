package com.banque.banque_service_analysedocument.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.banque.banque_service_analysedocument.model.AnalyseDocument;



// @RestResource(path = "clients")
@Repository
public interface AnalyseDocumentRepository extends JpaRepository<AnalyseDocument, Integer>{

}