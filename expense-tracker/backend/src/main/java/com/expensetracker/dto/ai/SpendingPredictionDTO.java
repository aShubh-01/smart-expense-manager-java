package com.expensetracker.dto.ai;

import lombok.Data;

@Data
public class SpendingPredictionDTO {

    private double projectedMonthEndSpending;
    private double currentSpending;
    private double averageDailySpending;
    private String riskLevel;
    private String insight;
}