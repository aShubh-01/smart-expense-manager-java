package com.expensetracker.controller;

import com.expensetracker.dto.CategorySummaryDTO;
import com.expensetracker.dto.ExpenseDTO;
import com.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseDTO> createExpense(@RequestHeader("X-User-Id") String userId, @Valid @RequestBody ExpenseDTO expenseDTO) {
        return new ResponseEntity<>(expenseService.createExpense(expenseDTO, userId), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(expenseService.getAllExpenses(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDTO> getExpenseById(@PathVariable String id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDTO> updateExpense(@PathVariable String id, @Valid @RequestBody ExpenseDTO expenseDTO) {
        return ResponseEntity.ok(expenseService.updateExpense(id, expenseDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable String id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByCategory(@RequestHeader("X-User-Id") String userId, @PathVariable String category) {
        return ResponseEntity.ok(expenseService.getExpensesByCategory(category, userId));
    }

    @GetMapping("/monthly-summary")
    public ResponseEntity<List<CategorySummaryDTO>> getMonthlySummary(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(expenseService.getMonthlySummary(userId));
    }
}
