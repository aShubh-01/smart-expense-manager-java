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
    private String status; // ACTIVE, COMPLETED
}
