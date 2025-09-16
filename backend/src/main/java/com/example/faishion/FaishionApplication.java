package com.example.faishion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FaishionApplication {

    public static void main(String[] args) {
        SpringApplication.run(FaishionApplication.class, args);
    }

}
