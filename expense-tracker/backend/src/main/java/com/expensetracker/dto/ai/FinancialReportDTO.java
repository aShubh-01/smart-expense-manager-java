package com.expensetracker.dto.ai;

import lombok.Data;
import java.util.List;

@Data
public class FinancialReportDTO {

    private String financialHealth;
    private double expenseRatio;
    private double monthlySurplus;
    private int estimatedTimeToGoalDays;

    private List<CategoryBreakdownDTO> categoryBreakdown;
    private List<String> recommendations;
}