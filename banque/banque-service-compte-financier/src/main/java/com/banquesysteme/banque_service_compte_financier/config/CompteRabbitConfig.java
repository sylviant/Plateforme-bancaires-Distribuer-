
package com.banquesysteme.banque_service_compte_financier.config;

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

// Mettre ici l'import exact de ta classe de réception locale (UserValidatedPayload ou UserDto local)
import com.banquesysteme.banque_service_compte_financier.service.CompteListener.UserValidatedPayload;

@Configuration
public class CompteRabbitConfig {

    public static final String QUEUE_NAME = "queue-compte";
    public static final String EXCHANGE_NAME = "user-exchange";
    public static final String ROUTING_KEY = "user.validated";

    @Bean
    public Queue compteQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding binding(Queue compteQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(compteQueue).to(userExchange).with(ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        DefaultClassMapper classMapper = new DefaultClassMapper();
        
        // 1. On autorise tous les packages
        classMapper.setTrustedPackages("*"); 
        
        // 2. On force l'équivalence entre la classe distante et notre classe locale
        Map<String, Class<?>> idClassMapping = new HashMap<>();
        idClassMapping.put("com.banquesysteme.banque_user_service.dto.UserDto", UserValidatedPayload.class);
        classMapper.setIdClassMapping(idClassMapping);
        
        converter.setClassMapper(classMapper);
        return converter;
    }
}


// package com.banquesysteme.banque_service_compte_financier.config;

// import org.springframework.amqp.core.Binding;
// import org.springframework.amqp.core.BindingBuilder;
// import org.springframework.amqp.core.Queue;
// import org.springframework.amqp.core.TopicExchange;
// import org.springframework.amqp.support.converter.DefaultClassMapper;
// import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// @Configuration
// public class CompteRabbitConfig {

//     public static final String QUEUE_NAME = "queue-compte";
//     public static final String EXCHANGE_NAME = "user-exchange";
//     public static final String ROUTING_KEY = "user.validated";

//     @Bean
//     public Queue compteQueue() {
//         return new Queue(QUEUE_NAME, true); // durable = true
//     }

//     @Bean
//     public TopicExchange userExchange() {
//         return new TopicExchange(EXCHANGE_NAME);
//     }

//     @Bean
//     public Binding binding(Queue compteQueue, TopicExchange userExchange) {
//         return BindingBuilder.bind(compteQueue).to(userExchange).with(ROUTING_KEY);
//     }

//     // ✅ UN SEUL CONVERTISSEUR UNIQUE AVEC LE CORRECTIF DE SÉCURITÉ
//     @Bean
//     public Jackson2JsonMessageConverter messageConverter() {
//         Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        
//         DefaultClassMapper classMapper = new DefaultClassMapper();
//         // Force Jackson à accepter le DTO, peu importe son package d'origine
//         classMapper.setTrustedPackages("*"); 
        
//         converter.setClassMapper(classMapper);
//         return converter;
//     }
// }


// package com.banquesysteme.banque_service_compte_financier.config;

// import org.springframework.amqp.core.Binding;
// import org.springframework.amqp.core.BindingBuilder;
// import org.springframework.amqp.core.Queue;
// import org.springframework.amqp.core.TopicExchange;
// import org.springframework.amqp.support.converter.DefaultClassMapper;
// import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// @Configuration
// public class CompteRabbitConfig {

//     public static final String QUEUE_NAME = "queue-compte";
//     public static final String EXCHANGE_NAME = "user-exchange";
//     public static final String ROUTING_KEY = "user.validated";

//     @Bean
//     public Queue compteQueue() {
//         return new Queue(QUEUE_NAME, true); // durable = true
//     }

//     @Bean
//     public TopicExchange userExchange() {
//         return new TopicExchange(EXCHANGE_NAME);
//     }

//     // Liaison (Binding) entre la File et l'Exchange via la Routing Key
//     @Bean
//     public Binding binding(Queue compteQueue, TopicExchange userExchange) {
//         return BindingBuilder.bind(compteQueue).to(userExchange).with(ROUTING_KEY);
//     }

//     // Renommé pour éviter le conflit de Bean global
//     @Bean(name = "compteMessageConverter")
//     public Jackson2JsonMessageConverter compteMessageConverter() {
//         return new Jackson2JsonMessageConverter();
//     }

//     @Bean
//     public Jackson2JsonMessageConverter messageConverter() {
//         Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        
//         // 1. On crée un mappeur de classe flexible
//         DefaultClassMapper classMapper = new DefaultClassMapper();
        
//         // 2. IMPORTANT : On dit à Spring d'accepter de convertir le message 
//         // peu importe d'où il vient (le package d'origine n'a plus d'importance)
//         classMapper.setTrustedPackages("*"); 
        
//         converter.setClassMapper(classMapper);
//         return converter;
//     }
// }


// package com.banquesysteme.banque_service_compte_financier.config;

// import org.springframework.amqp.core.Binding;
// import org.springframework.amqp.core.BindingBuilder;
// import org.springframework.amqp.core.Queue;
// import org.springframework.amqp.core.TopicExchange;
// import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;


// @Configuration
// public class CompteRabbitConfig {

//     public static final String QUEUE_NAME = "queue-compte";
//     public static final String EXCHANGE_NAME = "user-exchange";
//     public static final String ROUTING_KEY = "user.validated";

//     @Bean
//     public Queue compteQueue() {
//         return new Queue(QUEUE_NAME, true); // durable = true
//     }

//     @Bean
//     public TopicExchange userExchange() {
//         return new TopicExchange(EXCHANGE_NAME);
//     }

//     // Liaison (Binding) entre la File et l'Exchange via la Routing Key
//     @Bean
//     public Binding binding(Queue compteQueue, TopicExchange userExchange) {
//         return BindingBuilder.bind(compteQueue).to(userExchange).with(ROUTING_KEY);
//     }

//     @Bean
//     public Jackson2JsonMessageConverter messageConverter() {
//         return new Jackson2JsonMessageConverter();
//     }
// }