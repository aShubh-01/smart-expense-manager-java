package com.expensetracker;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ExpenseTrackerApplication {
	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().load();
		System.setProperty("MONGODB_URI", dotenv.get("MONGODB_URI"));
		System.setProperty("GEMINI_API_KEY", dotenv.get("GEMINI_API_KEY"));
		SpringApplication.run(ExpenseTrackerApplication.class, args);
	}
}
