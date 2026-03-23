package com.expensetracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "recurringBills")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecurringBill {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    private String title;
    private double amount;
    private String frequency; // MONTHLY, QUARTERLY, YEARLY
    private String category;
    private LocalDate nextDueDate;
    private String status; // ACTIVE, PAUSED
}
