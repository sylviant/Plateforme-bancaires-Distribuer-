package com.banque.banque_service_notification.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.DefaultClassMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.HashMap;
import java.util.Map;

// Import dynamique de ta classe interne de payload
import com.banque.banque_service_notification.notificationservice.CommsumerNotifi.UserValidatedPayload;

@Configuration
public class ComsummerNotification {

    // ✅ Changé pour avoir sa propre Queue et ne pas interférer avec le microservice Compte
    public static final String QUEUE_NAME = "queue-notification"; 
    public static final String EXCHANGE_NAME = "user-exchange";
    public static final String ROUTING_KEY = "user.validated";

    @Bean
    public Queue notificationQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding binding(Queue notificationQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(notificationQueue).to(userExchange).with(ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        DefaultClassMapper classMapper = new DefaultClassMapper();
        
        classMapper.setTrustedPackages("*"); 
        
        Map<String, Class<?>> idClassMapping = new HashMap<>();
        idClassMapping.put("com.banquesysteme.banque_user_service.dto.UserDto", UserValidatedPayload.class);
        classMapper.setIdClassMapping(idClassMapping);
        
        converter.setClassMapper(classMapper);
        return converter;
    }
}


// package com.banque.banque_service_notification.config;

// // public class ComsummerNotification {

// // }



// //package com.banquesysteme.banque_service_compte_financier.config;

// import org.springframework.amqp.core.Binding;
// import org.springframework.amqp.core.BindingBuilder;
// import org.springframework.amqp.core.Queue;
// import org.springframework.amqp.core.TopicExchange;
// import org.springframework.amqp.support.converter.DefaultClassMapper;
// import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import java.util.HashMap;
// import java.util.Map;

// // Mettre ici l'import exact de ta classe de réception locale (UserValidatedPayload ou UserDto local)
// import com.banque.banque_service_notification.notificationservice.CommsumerNotifi.UserValidatedPayload;

// @Configuration
// public class ComsummerNotification {

//     public static final String QUEUE_NAME = "queue-compte";
//     public static final String EXCHANGE_NAME = "user-exchange";
//     public static final String ROUTING_KEY = "user.validated";

//     @Bean
//     public Queue compteQueue() {
//         return new Queue(QUEUE_NAME, true);
//     }

//     @Bean
//     public TopicExchange userExchange() {
//         return new TopicExchange(EXCHANGE_NAME);
//     }

//     @Bean
//     public Binding binding(Queue compteQueue, TopicExchange userExchange) {
//         return BindingBuilder.bind(compteQueue).to(userExchange).with(ROUTING_KEY);
//     }

//     @Bean
//     public Jackson2JsonMessageConverter messageConverter() {
//         Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
//         DefaultClassMapper classMapper = new DefaultClassMapper();
        
//         // 1. On autorise tous les packages
//         classMapper.setTrustedPackages("*"); 
        
//         // 2. On force l'équivalence entre la classe distante et notre classe locale
//         Map<String, Class<?>> idClassMapping = new HashMap<>();
//         idClassMapping.put("com.banquesysteme.banque_user_service.dto.UserDto", UserValidatedPayload.class);
//         classMapper.setIdClassMapping(idClassMapping);
        
//         converter.setClassMapper(classMapper);
//         return converter;
//     }
// }
