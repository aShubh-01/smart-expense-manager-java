package com.expensetracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "expenses")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Expense {
    @Id
    private String id;
    private String title;
    private Double amount;
    private String category;
    private String description;
    private String paymentMethod;
    private LocalDate date;
    private LocalDateTime createdAt;
}
