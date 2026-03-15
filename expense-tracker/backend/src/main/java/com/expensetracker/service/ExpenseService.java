package com.expensetracker.service;

import com.expensetracker.dto.CategorySummaryDTO;
import com.expensetracker.dto.ExpenseDTO;

import java.util.List;

public interface ExpenseService {
    ExpenseDTO createExpense(ExpenseDTO expenseDTO);
    List<ExpenseDTO> getAllExpenses();
    ExpenseDTO getExpenseById(String id);
    ExpenseDTO updateExpense(String id, ExpenseDTO expenseDTO);
    void deleteExpense(String id);
    List<ExpenseDTO> getExpensesByCategory(String category);
    List<CategorySummaryDTO> getMonthlySummary();
}
