package com.expensetracker.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "userProfiles")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfile {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String userId;
    
    private Double monthlyIncome;
    private double savingsGoal;
    private double monthlyBudget;
    private String financialDescription; // "save for a house", "student with tight budget", etc.
    private String strategy; // "Aggressive", "Moderate", "Conservative"
}
