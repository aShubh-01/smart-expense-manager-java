package com.expensetracker.service.ai;

import com.expensetracker.dto.ai.BehaviorInsightDTO;
import com.expensetracker.dto.ai.FinancialReportDTO;
import com.expensetracker.dto.ai.SpendingPredictionDTO;
import com.expensetracker.model.*;
import com.expensetracker.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIAnalysisService {

    private final ExpenseRepository expenseRepository;
    private final UserProfileRepository profileRepository;
    private final EMIRepository emiRepository;
    private final DebtRepository debtRepository;
    private final RecurringBillRepository recurringBillRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final GeminiService geminiService;

    private final ObjectMapper mapper = new ObjectMapper();


    private UserProfile getUserProfile(String userId) {
        return profileRepository.findByUserId(userId)
                .orElse(new UserProfile(null, userId, 0.0, 0.0, 0.0, "New User", "Moderate"));
    }



    // =========================
    // FINANCIAL REPORT
    // =========================
    public FinancialReportDTO generateFinancialReport(String userId) throws Exception {
        UserProfile profile = getUserProfile(userId);
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        List<EMI> emis = emiRepository.findByUserId(userId);
        List<Debt> debts = debtRepository.findByUserId(userId);
        List<RecurringBill> bills = recurringBillRepository.findByUserId(userId);

        double totalSpent = expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();
        double totalEmis = emis.stream().mapToDouble(EMI::getAmount).sum();
        double totalBills = bills.stream().mapToDouble(RecurringBill::getAmount).sum();
        double totalDebt = debts.stream().mapToDouble(d -> d.getTotalAmount() - d.getAmountPaid()).sum();

        Map<String, Double> categoryTotals =
                expenses.stream()
                        .collect(Collectors.groupingBy(
                                Expense::getCategory,
                                Collectors.summingDouble(Expense::getAmount)));

        double incomeVal = profile.getMonthlyIncome();
        double totalCommitted = totalSpent + totalEmis + totalBills;
        double expenseRatio = incomeVal == 0 ? 0 : (totalCommitted / incomeVal) * 100;

        String prompt = """
You are a professional financial advisor AI.

Analyze the financial status for a user with the following profile:
- Monthly Income: %.2f
- General Context: %s
- Monthly Budget Target: %.2f
- Monthly Savings Goal: %.2f
- Financial Strategy: %s

CURRENT DATA:
- Total Direct Expenses: %.2f
- Total Fixed Monthly EMIs: %.2f
- Total Monthly Bills: %.2f
- Total Outstanding Debt: %.2f
- Expense/Income Ratio (with fixed costs): %.1f%%
- Category-wise Spending: %s

  TASK:
  1. Assess financial health (poor | average | good | excellent) based on the budget and goals.
  2. Provide a detailed category breakdown.
  3. Calculate monthly surplus/deficit (Income - (Expenses + EMIs + Bills)).
  4. CRITICAL: If surplus is negative, 'bufferDays' and 'estimatedTimeToGoalDays' MUST BE 0. You cannot have negative days of buffer.
  5. CRITICAL: If surplus is negative, 'emiMissProbability' MUST BE high (80-100%%) as income does not cover fixed obligations.
  6. Calculate 'bufferDays' as (Income / Daily Burn Rate) ONLY if income covers costs, otherwise 0.
  7. Provide 3-5 realistic and actionable recommendations focused on crisis management if in deficit.

  Return ONLY valid JSON.
  {
   "financialHealth":"string",
   "expenseRatio":number,
   "monthlySurplus":number,
   "estimatedTimeToGoalDays":number,
   "debtLoadPercentage":number,
   "fixedCommitmentRatio":number,
   "emiMissProbability":number,
   "fixedCostHealth":"string",
   "burnRateStatus":"string",
   "bufferDays":number,
   "categoryBreakdown":[
     {"category":"string","percentage":number}
   ],
   "recommendations":[
     "string"
   ]
  }
  """.formatted(incomeVal, profile.getFinancialDescription(), profile.getMonthlyBudget(), 
                  profile.getSavingsGoal(), profile.getStrategy(), totalSpent, totalEmis, totalBills, totalDebt, expenseRatio, categoryTotals);

        String response = geminiService.askGemini(prompt);
        return mapper.readValue(cleanJson(response), FinancialReportDTO.class);
    }


    // =========================
    // SPENDING PREDICTION
    // =========================
    public SpendingPredictionDTO predictSpending(String userId) throws Exception {
        UserProfile profile = getUserProfile(userId);
        List<EMI> emis = emiRepository.findByUserId(userId);
        List<RecurringBill> bills = recurringBillRepository.findByUserId(userId);
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        double totalSpent = expenses.stream().mapToDouble(Expense::getAmount).sum();
        double fixedCosts = emis.stream().mapToDouble(EMI::getAmount).sum() + 
                           bills.stream().mapToDouble(RecurringBill::getAmount).sum();

        int currentDay = LocalDate.now().getDayOfMonth();
        double avgDailySpending = currentDay == 0 ? 0 : totalSpent / currentDay;
        int daysInMonth = LocalDate.now().lengthOfMonth();
        double monthlyBudget = profile.getMonthlyBudget();

        String prompt = """
You are a predictive financial engine.

USER PROFILE:
- Target Monthly Budget: %.2f
- Lifestyle Context: %s

HISTORICAL DATA:
- Current Variable Spending (Expenses): %.2f
- Fixed Monthly Obligations (EMIs + Bills): %.2f
- Average Daily Variable Spending: %.2f
- Current day of the month: %d / %d

TASK:
1. Predict total ending spending (Variable * days + Fixed).
2. Calculate risk level (low | medium | high) relative to their %.2f budget.
3. Provide a concise behavior-driven insight.

Return ONLY JSON:
{
 "projectedMonthEndSpending":number,
 "currentSpending":number,
 "averageDailySpending":number,
 "riskLevel":"string",
 "insight":"string"
}
""".formatted(monthlyBudget, profile.getFinancialDescription(), totalSpent, fixedCosts, avgDailySpending, 
                LocalDate.now().getDayOfMonth(), daysInMonth, monthlyBudget);

        String response = geminiService.askGemini(prompt);
        return mapper.readValue(cleanJson(response), SpendingPredictionDTO.class);
    }


    // =========================
    // BEHAVIOR INSIGHTS
    // =========================
    public BehaviorInsightDTO behaviorInsights(String userId) throws Exception {
        UserProfile profile = getUserProfile(userId);
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        Map<String, Long> categoryFrequency =
                expenses.stream()
                        .collect(Collectors.groupingBy(
                                Expense::getCategory,
                                Collectors.counting()));

        String prompt = """
You are a behavior economics expert.

PERSONAL PROFILE:
- Lifestyle: %s
- Goals: %s

SPENDING DATA (Frequency):
- %s

TASK:
1. Identify the dominant spending category.
2. Determine if spending patterns align with their lifestyle/goals.
3. Provide deep psychological insights into their spending.

Return ONLY JSON:
{
 "dominantCategory":"string",
 "dominantCategoryPercentage":number,
 "weekendSpendingHigh":boolean,
 "insights":[
   "string"
 ]
}
""".formatted(profile.getFinancialDescription(), profile.getStrategy(), categoryFrequency);

        String response = geminiService.askGemini(prompt);
        return mapper.readValue(cleanJson(response), BehaviorInsightDTO.class);
    }


    // =========================
    // AI CONSULTANT (CHAT)
    // =========================
    public String consultantChat(String userId, String userMessage) throws Exception {
        UserProfile profile = getUserProfile(userId);
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        List<com.expensetracker.model.EMI> emis = emiRepository.findByUserId(userId);
        List<com.expensetracker.model.Debt> debts = debtRepository.findByUserId(userId);
        List<com.expensetracker.model.RecurringBill> bills = recurringBillRepository.findByUserId(userId);

        double totalSpent = expenses.stream().mapToDouble(Expense::getAmount).sum();
        double totalDebt = debts.stream().mapToDouble(d -> d.getTotalAmount() - d.getAmountPaid()).sum();
        double monthlyEmiTotal = emis.stream().mapToDouble(com.expensetracker.model.EMI::getAmount).sum();
        double totalBillsSum = bills.stream().mapToDouble(com.expensetracker.model.RecurringBill::getAmount).sum();

        String context = """
                USER FINANCIAL SNAPSHOT:
                - Income: %.2f
                - Monthly Budget: %.2f
                - Profile: %s
                - Total Spent This Month: %.2f
                - Active EMIs: %d (Total Monthly: %.2f)
                - Total Outstanding Debt: %.2f
                - Recurring Monthly Bills: %d (Total Monthly: %.2f)
                - Grand Total Monthly Commitments (EMI + Bills): %.2f
                
                DATA DETAILS:
                - CATEGORIES: %s
                - BILLS: %s
                - EMIS: %s
                """.formatted(
                        profile.getMonthlyIncome(), profile.getMonthlyBudget(), profile.getFinancialDescription(),
                        totalSpent, emis.size(), monthlyEmiTotal, totalDebt, bills.size(), totalBillsSum,
                        (monthlyEmiTotal + totalBillsSum),
                        expenses.stream().collect(Collectors.groupingBy(Expense::getCategory, Collectors.summingDouble(Expense::getAmount))),
                        bills.stream().map(b -> b.getTitle() + " (₹" + b.getAmount() + ")").collect(Collectors.toList()),
                        emis.stream().map(e -> e.getLoanName() + " (₹" + e.getAmount() + ")").collect(Collectors.toList())
        );

        // Fetch Last 10 messages for context
        List<ChatMessage> history = chatMessageRepository.findByUserIdOrderByTimestampAsc(userId);
        String chatHistory = history.stream()
                .skip(Math.max(0, history.size() - 8)) // Limit to last 8 messages for token efficiency
                .map(msg -> msg.getRole().toUpperCase() + ": " + msg.getText())
                .collect(Collectors.joining("\n"));

        String systemPrompt = """
                You are 'Vance', a highly experienced Personal Financial Consultant.
                You have access to the user's live financial data provided in the SNAPSHOT below.
                
                IMPORTANT: 
                - If Income is 0.00 and Budget is 0.00, it means the user has NOT set up their profile yet. 
                - In this case, your FIRST priority is to kindly ask the user to set up their "Finance Settings" in the Analytics page so you can give accurate advice.
                - If there are NO expenses, EMIs, or bills, acknowledge that they have a clean slate but still need a profile for meaningful planning.
                - CRITICAL: When calculating or discussing totals, ALWAYS prioritize the numerical totals provided in the SNAPSHOT section (like 'Grand Total Monthly Commitments') over manually summing individual items. This ensures mathematical accuracy.
                - When calculating surplus/leftover amounts, you MUST include: (Total Bills + Monthly EMIs + Current Month Expenses + Total Debt repayment if asked).
                - Use the USER FINANCIAL SNAPSHOT data as a baseline, but IF the user mentions a specific income or cost change in the conversation, prioritize that conversation context.
                
                RESPONSE CONSTRAINTS:
                1. Keep the response compact, shorter, and simple (ideally less than 200 words).
                2. Do NOT use bullet points, markdown lists, or bold/italic markers.
                3. The response MUST be a single, natural paragraph of text.
                4. Do NOT output JSON or any code formatting.
                
                Your goal:
                - Provide personalized, data-driven financial advice in a simple way.
                - Be proactive: if user asks about a purchase, check their budget/EMI/Debt.
                - Be professional yet encouraging.
                
                %s
                
                CONVERSATION HISTORY:
                %s
                
                Current User Message: %s
                """.formatted(context, chatHistory.isEmpty() ? "No prior history." : chatHistory, userMessage);

        String response = geminiService.askGemini(systemPrompt);

        // Save History
        chatMessageRepository.save(new ChatMessage(null, userId, "user", userMessage, LocalDateTime.now()));
        chatMessageRepository.save(new ChatMessage(null, userId, "bot", response, LocalDateTime.now()));

        return response;
    }

    public List<ChatMessage> getChatHistory(String userId) {
        return chatMessageRepository.findByUserIdOrderByTimestampAsc(userId);
    }

    public void deleteChatHistory(String userId) {
        List<ChatMessage> history = chatMessageRepository.findByUserIdOrderByTimestampAsc(userId);
        chatMessageRepository.deleteAll(history);
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