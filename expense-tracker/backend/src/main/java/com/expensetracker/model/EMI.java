package com.expensetracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "emis")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EMI {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    private String loanName;
    private double amount;
    private double interestRate;
    private int totalTenureMonths;
    private int remainingTenureMonths;
    private LocalDate startDate;
    private LocalDate nextInstallmentDate;
    private String recurrenceType; // DAILY, WEEKLY, MONTHLY, YEARLY
    private int recurrenceValue; // e.g. every 1 month, every 3 months
    private LocalDate lastPaidDate; 
    private boolean isPaid; // NEW: track current cycle payment
    private String status; // ACTIVE, COMPLETED
}
