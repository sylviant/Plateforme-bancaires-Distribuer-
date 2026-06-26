package com.banquesysteme.banque_service_compte_financier.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ProducerCompTransactRabbitConfig {

    public static final String EXCHANGE_NAME = "compte-exchange";
    public static final String ROUTING_KEY = "compte.validated";

    @Bean
    public TopicExchange compteExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // Renommé pour lever toute ambiguïté avec l'autre configuration
    @Bean(name = "producerMessageConverter")
    public Jackson2JsonMessageConverter producerMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory, 
            @Qualifier("producerMessageConverter") Jackson2JsonMessageConverter converter) {
        
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter); // Injection sécurisée du convertisseur dédié
        return template;
    }
}


// package com.banquesysteme.banque_service_compte_financier.config;

// import org.springframework.amqp.core.TopicExchange;
// import org.springframework.amqp.rabbit.connection.ConnectionFactory;
// import org.springframework.amqp.rabbit.core.RabbitTemplate;
// import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// @Configuration
// public class ProducerCompTransactRabbitConfig {

//     public static final String EXCHANGE_NAME = "compte-exchange";
//     public static final String ROUTING_KEY = "compte.validated";

//     @Bean
//     public TopicExchange compteExchange() {
//         return new TopicExchange(EXCHANGE_NAME);
//     }

//     // Convertisseur pour envoyer les messages au format JSON
//     @Bean
//     public Jackson2JsonMessageConverter messageConverter() {
//         return new Jackson2JsonMessageConverter();
//     }

//     @Bean
//     public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
//         RabbitTemplate template = new RabbitTemplate(connectionFactory);
//         template.setMessageConverter(messageConverter());
//         return template;
//     }
// }
