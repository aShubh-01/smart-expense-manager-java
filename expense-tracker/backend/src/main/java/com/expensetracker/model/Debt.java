package com.expensetracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "debts")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Debt {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    private String lender;
    private double totalAmount;
    private double amountPaid;
    private double currentBalance;
    private double interestRate;
    private LocalDate dueDate;
    private String status; // ACTIVE, SETTLED
}
