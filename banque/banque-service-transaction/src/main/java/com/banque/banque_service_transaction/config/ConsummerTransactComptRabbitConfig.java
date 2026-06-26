package com.banque.banque_service_transaction.config;  // Gardez le package que vous voulez

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ConsummerTransactComptRabbitConfig {

    public static final String QUEUE_NAME = "queue-transaction";
    public static final String EXCHANGE_NAME = "compte-exchange";
    public static final String ROUTING_KEY = "compte.validated";

    @Bean
    public Queue transactionQueue() {  // ✅ Nom cohérent
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public TopicExchange compteExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // ✅ Correction : utiliser le bon nom de queue
    @Bean
    public Binding binding(Queue transactionQueue, TopicExchange compteExchange) {
        return BindingBuilder.bind(transactionQueue).to(compteExchange).with(ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}


// //package com.banquesysteme.banque_service_compte_financier.config;
// package com.banque.banque_service_transaction.config;

// import org.springframework.amqp.core.Binding;
// import org.springframework.amqp.core.BindingBuilder;
// import org.springframework.amqp.core.Queue;
// import org.springframework.amqp.core.TopicExchange;
// import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;


// @Configuration
// public class ConsummerTransactComptRabbitConfig {

//     public static final String QUEUE_NAME = "queue-transaction";
//     // public static final String EXCHANGE_NAME = "user-exchange";
//     // public static final String ROUTING_KEY = "user.validated";
//     public static final String EXCHANGE_NAME = "compte-exchange";
//     public static final String ROUTING_KEY = "compte.validated";

//     @Bean
//     public Queue transactionQueue() {
//         return new Queue(QUEUE_NAME, true); // durable = true
//     }

//     @Bean
//     public TopicExchange compteExchange() {
//         return new TopicExchange(EXCHANGE_NAME);
//     }

//     // Liaison (Binding) entre la File et l'Exchange via la Routing Key
//     @Bean
//     public Binding binding(Queue compteQueue, TopicExchange compteExchange) {
//         return BindingBuilder.bind(compteQueue).to(compteExchange).with(ROUTING_KEY);
//     }

//     @Bean
//     public Jackson2JsonMessageConverter messageConverter() {
//         return new Jackson2JsonMessageConverter();
//     }
// }