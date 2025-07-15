package com.recipe;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import java.util.Properties;
import java.util.UUID;
import java.time.Instant;

public class UserProfileProducer {
    public static void main(String[] args) {
        Properties props = new Properties();
        props.put("bootstrap.servers", "localhost:9092");
        props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

        KafkaProducer<String, String> producer = new KafkaProducer<>(props);

        String userId = UUID.randomUUID().toString();
        String createdAt = Instant.now().toString();
        String userProfileJson = String.format(
                "{\"type\":\"user_profile\",\"user_id\":\"%s\",\"name\":\"Alice\",\"email\":\"alice@example.com\",\"friends\":[\"bob\",\"carol\"],\"posts\":[\"Hello world!\"],\"created_at\":\"%s\"}",
                userId, createdAt);

        producer.send(new ProducerRecord<>("userprofile", userProfileJson));
        producer.close();
    }
}
