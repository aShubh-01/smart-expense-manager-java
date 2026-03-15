package com.expensetracker.service.impl;

import com.expensetracker.dto.CategorySummaryDTO;
import com.expensetracker.dto.ExpenseDTO;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Expense;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public ExpenseDTO createExpense(ExpenseDTO expenseDTO) {
        Expense expense = mapToEntity(expenseDTO);
        expense.setCreatedAt(LocalDateTime.now());
        Expense savedExpense = expenseRepository.save(expense);
        return mapToDTO(savedExpense);
    }

    @Override
    public List<ExpenseDTO> getAllExpenses() {
        return expenseRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ExpenseDTO getExpenseById(String id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        return mapToDTO(expense);
    }

    @Override
    public ExpenseDTO updateExpense(String id, ExpenseDTO expenseDTO) {
        Expense existingExpense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        
        existingExpense.setTitle(expenseDTO.getTitle());
        existingExpense.setAmount(expenseDTO.getAmount());
        existingExpense.setCategory(expenseDTO.getCategory());
        existingExpense.setDescription(expenseDTO.getDescription());
        existingExpense.setPaymentMethod(expenseDTO.getPaymentMethod());
        existingExpense.setDate(expenseDTO.getDate());

        Expense updatedExpense = expenseRepository.save(existingExpense);
        return mapToDTO(updatedExpense);
    }

    @Override
    public void deleteExpense(String id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense not found with id: " + id);
        }
        expenseRepository.deleteById(id);
    }

    @Override
    public List<ExpenseDTO> getExpensesByCategory(String category) {
        return expenseRepository.findByCategory(category).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategorySummaryDTO> getMonthlySummary() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.group("category").sum("amount").as("totalAmount"),
                Aggregation.project("totalAmount").and("category").previousOperation()
        );

        AggregationResults<CategorySummaryDTO> results = mongoTemplate.aggregate(aggregation, "expenses", CategorySummaryDTO.class);
        return results.getMappedResults();
    }

    private ExpenseDTO mapToDTO(Expense expense) {
        return new ExpenseDTO(
                expense.getId(),
                expense.getTitle(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getDescription(),
                expense.getPaymentMethod(),
                expense.getDate()
        );
    }

    private Expense mapToEntity(ExpenseDTO dto) {
        return Expense.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .amount(dto.getAmount())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .paymentMethod(dto.getPaymentMethod())
                .date(dto.getDate())
                .build();
    }
}
