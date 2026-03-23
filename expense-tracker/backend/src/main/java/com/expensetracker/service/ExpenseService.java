package com.expensetracker.service;

import com.expensetracker.dto.CategorySummaryDTO;
import com.expensetracker.dto.ExpenseDTO;

import java.util.List;

public interface ExpenseService {
    ExpenseDTO createExpense(ExpenseDTO expenseDTO, String userId);
    List<ExpenseDTO> getAllExpenses(String userId);
    ExpenseDTO getExpenseById(String id);
    ExpenseDTO updateExpense(String id, ExpenseDTO expenseDTO);
    void deleteExpense(String id);
    List<ExpenseDTO> getExpensesByCategory(String category, String userId);
    List<CategorySummaryDTO> getMonthlySummary(String userId);
}
