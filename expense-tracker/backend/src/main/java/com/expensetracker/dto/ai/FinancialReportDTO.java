package com.expensetracker.dto.ai;

import lombok.Data;
import java.util.List;

@Data
public class FinancialReportDTO {

    private String financialHealth;
    private double expenseRatio;
    private double monthlySurplus;
    private int estimatedTimeToGoalDays;

    private double debtLoadPercentage;
    private double fixedCommitmentRatio;
    private double emiMissProbability; // 0-100%
    private String fixedCostHealth; // "Safe" | "Fair" | "High" | "Critical"
    private String burnRateStatus; // "Sustainable" | "Aggressive" | "Unsafe"
    private int bufferDays; // Days income covers total expenses

    private List<CategoryBreakdownDTO> categoryBreakdown;
    private List<String> recommendations;
}