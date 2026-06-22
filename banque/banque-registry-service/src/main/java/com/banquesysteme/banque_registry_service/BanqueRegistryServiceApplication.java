package com.banquesysteme.banque_registry_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class BanqueRegistryServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BanqueRegistryServiceApplication.class, args);
	}

}
