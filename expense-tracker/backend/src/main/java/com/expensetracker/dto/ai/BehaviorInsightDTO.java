package com.expensetracker.dto.ai;

import lombok.Data;
import java.util.List;

@Data
public class BehaviorInsightDTO {

    private String dominantCategory;
    private double dominantCategoryPercentage;
    private boolean weekendSpendingHigh;
    private List<String> insights;
}