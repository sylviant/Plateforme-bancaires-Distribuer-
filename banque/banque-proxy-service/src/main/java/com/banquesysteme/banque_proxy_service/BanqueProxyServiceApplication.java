package com.banquesysteme.banque_proxy_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class BanqueProxyServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BanqueProxyServiceApplication.class, args);
	}

}
