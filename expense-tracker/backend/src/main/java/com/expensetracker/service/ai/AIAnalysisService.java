package com.expensetracker.service.ai;

import com.expensetracker.dto.ai.BehaviorInsightDTO;
import com.expensetracker.dto.ai.FinancialReportDTO;
import com.expensetracker.dto.ai.SpendingPredictionDTO;
import com.expensetracker.model.Expense;
import com.expensetracker.repository.ExpenseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIAnalysisService {

    private final ExpenseRepository expenseRepository;
    private final GeminiService geminiService;

    private final ObjectMapper mapper = new ObjectMapper();


    // =========================
    // FINANCIAL REPORT
    // =========================
    public FinancialReportDTO generateFinancialReport(String income, String goal, String strategy) throws Exception {

        List<Expense> expenses = expenseRepository.findAll();

        double totalSpent = expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();

        Map<String, Double> categoryTotals =
                expenses.stream()
                        .collect(Collectors.groupingBy(
                                Expense::getCategory,
                                Collectors.summingDouble(Expense::getAmount)));

        double incomeVal = Double.parseDouble(income);
        double expenseRatio = incomeVal == 0 ? 0 : (totalSpent / incomeVal) * 100;

        String prompt = """
You are a financial AI.

Analyze the financial statistics below and return ONLY valid JSON.

DATA:
Income: %f
TotalExpenses: %f
ExpenseRatio: %f
SavingsGoal: %s
Strategy: %s
CategoryTotals: %s

Return JSON:

{
 "financialHealth":"poor | average | good | excellent",
 "expenseRatio":number,
 "monthlySurplus":number,
 "estimatedTimeToGoalDays":number,
 "categoryBreakdown":[
   {"category":"string","percentage":number}
 ],
 "recommendations":[
   "string"
 ]
}

Return ONLY JSON.
""".formatted(incomeVal, totalSpent, expenseRatio, goal, strategy, categoryTotals);

        String response = geminiService.askGemini(prompt);
        response = cleanJson(response);

        return mapper.readValue(response, FinancialReportDTO.class);
    }


    // =========================
    // SPENDING PREDICTION
    // =========================
    public SpendingPredictionDTO predictSpending() throws Exception {

        List<Expense> expenses = expenseRepository.findAll();

        double totalSpent = expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();

        long uniqueDays =
                expenses.stream()
                        .map(Expense::getDate)
                        .distinct()
                        .count();

        double avgDailySpending =
                uniqueDays == 0 ? 0 : totalSpent / uniqueDays;

        int daysInMonth = LocalDate.now().lengthOfMonth();

        double projectedMonthEnd = avgDailySpending * daysInMonth;

        String prompt = """
You are a financial AI.

Predict month-end spending.

DATA:
CurrentSpending:%f
AverageDailySpending:%f
DaysInMonth:%d

Return ONLY JSON:

{
 "projectedMonthEndSpending":number,
 "currentSpending":number,
 "averageDailySpending":number,
 "riskLevel":"low | medium | high",
 "insight":"short sentence"
}

Return ONLY JSON.
""".formatted(totalSpent, avgDailySpending, daysInMonth);

        String response = geminiService.askGemini(prompt);
        response = cleanJson(response);

        return mapper.readValue(response, SpendingPredictionDTO.class);
    }


    // =========================
    // BEHAVIOR INSIGHTS
    // =========================
    public BehaviorInsightDTO behaviorInsights() throws Exception {

        List<Expense> expenses = expenseRepository.findAll();

        Map<String, Long> categoryFrequency =
                expenses.stream()
                        .collect(Collectors.groupingBy(
                                Expense::getCategory,
                                Collectors.counting()));

        String prompt = """
Analyze the spending behavior.

DATA:
CategoryFrequency:%s

Return JSON:

{
 "dominantCategory":"string",
 "dominantCategoryPercentage":number,
 "weekendSpendingHigh":true,
 "insights":[
   "string"
 ]
}

Return ONLY JSON.
""".formatted(categoryFrequency);

        String response = geminiService.askGemini(prompt);
        response = cleanJson(response);

        return mapper.readValue(response, BehaviorInsightDTO.class);
    }


    // =========================
    // CLEAN JSON (LLM SAFETY)
    // =========================
    private String cleanJson(String text) {

        return text
                .replace("```json", "")
                .replace("```", "")
                .trim();
    }
}