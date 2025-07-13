package com.recipe;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import java.util.Properties;

public class FeedProducer {
    public static void main(String[] args) {
        Properties props = new Properties();
        props.put("bootstrap.servers", "localhost:9092");
        props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

        KafkaProducer<String, String> producer = new KafkaProducer<>(props);

        String recipeJson = """
                    {
                      \"title\": \"Spaghetti Bolognese\",
                      \"chef\": \"user123\",
                      \"ingredients\": [\"spaghetti\", \"meat\", \"tomato sauce\"]
                    }
                """;

        producer.send(new ProducerRecord<>("recipeconsumer", recipeJson));
        producer.close();
    }
}
