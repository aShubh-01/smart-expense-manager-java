package com.expensetracker.controller;

import com.expensetracker.dto.ai.BehaviorInsightDTO;
import com.expensetracker.dto.ai.FinancialReportDTO;
import com.expensetracker.dto.ai.SpendingPredictionDTO;
import com.expensetracker.service.ai.AIAnalysisService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;
import com.expensetracker.model.ChatMessage;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIController {

    private final AIAnalysisService aiService;

    @PostMapping("/financial-report")
    public FinancialReportDTO financialReport(@RequestHeader("X-User-Id") String userId) throws Exception {
        return aiService.generateFinancialReport(userId);
    }

    @GetMapping("/prediction")
    public SpendingPredictionDTO prediction(@RequestHeader("X-User-Id") String userId) throws Exception {
        return aiService.predictSpending(userId);
    }

    @GetMapping("/behavior-insights")
    public BehaviorInsightDTO behaviorInsights(@RequestHeader("X-User-Id") String userId) throws Exception {
        return aiService.behaviorInsights(userId);
    }

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestHeader("X-User-Id") String userId, @RequestBody ChatRequest request) throws Exception {
        String response = aiService.consultantChat(userId, request.getMessage());
        return Map.of("response", response);
    }

    @GetMapping("/history")
    public List<ChatMessage> getHistory(@RequestHeader("X-User-Id") String userId) {
        return aiService.getChatHistory(userId);
    }

    @DeleteMapping("/history")
    public void deleteHistory(@RequestHeader("X-User-Id") String userId) {
        aiService.deleteChatHistory(userId);
    }

    @Data
    public static class ChatRequest {
        private String message;
    }

    @Data
    public static class FinancialRequest {
        private String income;
        private String goal;
        private String strategy;
    }
}