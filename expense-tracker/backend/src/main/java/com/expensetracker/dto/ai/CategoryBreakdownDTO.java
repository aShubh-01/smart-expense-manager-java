package com.expensetracker.dto.ai;

import lombok.Data;

@Data
public class CategoryBreakdownDTO {

    private String category;
    private double percentage;
}