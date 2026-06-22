package com.banquesysteme.banque_user_service.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserRabbitConfig {

    public static final String EXCHANGE_NAME = "user-exchange";
    public static final String ROUTING_KEY = "user.validated";

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // Convertisseur pour envoyer les messages au format JSON
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
