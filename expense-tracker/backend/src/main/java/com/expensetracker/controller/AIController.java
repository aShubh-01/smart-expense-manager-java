package com.expensetracker.controller;

import com.expensetracker.dto.ai.BehaviorInsightDTO;
import com.expensetracker.dto.ai.FinancialReportDTO;
import com.expensetracker.dto.ai.SpendingPredictionDTO;
import com.expensetracker.service.ai.AIAnalysisService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIController {

    private final AIAnalysisService aiService;

    @PostMapping("/financial-report")
    public FinancialReportDTO financialReport(@RequestBody FinancialRequest req) throws Exception {

        return aiService.generateFinancialReport(
                req.getIncome(),
                req.getGoal(),
                req.getStrategy()
        );
    }

    @GetMapping("/prediction")
    public SpendingPredictionDTO prediction() throws Exception {

        return aiService.predictSpending();
    }

    @GetMapping("/behavior-insights")
    public BehaviorInsightDTO behaviorInsights() throws Exception {

        return aiService.behaviorInsights();
    }

    @Data
    public static class FinancialRequest {
        private String income;
        private String goal;
        private String strategy;
    }
}