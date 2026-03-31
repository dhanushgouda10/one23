package com.one23.one23;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class One23Application {

	public static void main(String[] args) {
		SpringApplication.run(One23Application.class, args);
	}

}
