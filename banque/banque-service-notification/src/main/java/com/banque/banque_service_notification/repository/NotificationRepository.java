package com.banque.banque_service_notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.banque.banque_service_notification.model.Notification;



// @RestResource(path = "clients")
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer>{

}