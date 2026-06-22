package com.banquesysteme.banque_service_compte_financier.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class CompteRabbitConfig {

    public static final String QUEUE_NAME = "queue-compte";
    public static final String EXCHANGE_NAME = "user-exchange";
    public static final String ROUTING_KEY = "user.validated";

    @Bean
    public Queue compteQueue() {
        return new Queue(QUEUE_NAME, true); // durable = true
    }

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // Liaison (Binding) entre la File et l'Exchange via la Routing Key
    @Bean
    public Binding binding(Queue compteQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(compteQueue).to(userExchange).with(ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}