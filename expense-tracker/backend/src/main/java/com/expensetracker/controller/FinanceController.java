package com.expensetracker.controller;

import com.expensetracker.model.Debt;
import com.expensetracker.model.EMI;
import com.expensetracker.model.RecurringBill;
import com.expensetracker.repository.DebtRepository;
import com.expensetracker.repository.EMIRepository;
import com.expensetracker.repository.RecurringBillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FinanceController {

    private final EMIRepository emiRepository;
    private final DebtRepository debtRepository;
    private final RecurringBillRepository billRepository;

    // --- EMI ---
    @GetMapping("/emis")
    public List<EMI> getEmis(@RequestHeader("X-User-Id") String userId) {
        List<EMI> emis = emiRepository.findByUserId(userId);
        LocalDate today = LocalDate.now();
        for (EMI emi : emis) {
            // If due date is passed and still marked as paid, it means new cycle started
            if (emi.getNextInstallmentDate() != null && emi.getNextInstallmentDate().isBefore(today) && emi.isPaid()) {
                emi.setPaid(false);
                // We should also potentially advance the nextInstallmentDate here if it's way behind
                // but for now just setting it to pending
                emiRepository.save(emi);
            }
        }
        return emis;
    }

    @PostMapping("/emis")
    public EMI saveEmi(@RequestHeader("X-User-Id") String userId, @RequestBody EMI emi) {
        emi.setUserId(userId);
        return emiRepository.save(emi);
    }

    @DeleteMapping("/emis/{id}")
    public void deleteEmi(@PathVariable String id) {
        emiRepository.deleteById(id);
    }

    // --- Debt ---
    @GetMapping("/debts")
    public List<Debt> getDebts(@RequestHeader("X-User-Id") String userId) {
        return debtRepository.findByUserId(userId);
    }

    @PostMapping("/debts")
    public Debt saveDebt(@RequestHeader("X-User-Id") String userId, @RequestBody Debt debt) {
        debt.setUserId(userId);
        return debtRepository.save(debt);
    }

    @DeleteMapping("/debts/{id}")
    public void deleteDebt(@PathVariable String id) {
        debtRepository.deleteById(id);
    }

    // --- Bills ---
    @GetMapping("/bills")
    public List<RecurringBill> getBills(@RequestHeader("X-User-Id") String userId) {
        List<RecurringBill> bills = billRepository.findByUserId(userId);
        LocalDate today = LocalDate.now();
        for (RecurringBill bill : bills) {
            if (bill.getNextDueDate() != null && bill.getNextDueDate().isBefore(today) && bill.isPaid()) {
                bill.setPaid(false);
                billRepository.save(bill);
            }
        }
        return bills;
    }

    @PostMapping("/bills")
    public RecurringBill saveBill(@RequestHeader("X-User-Id") String userId, @RequestBody RecurringBill bill) {
        bill.setUserId(userId);
        return billRepository.save(bill);
    }

    @DeleteMapping("/bills/{id}")
    public void deleteBill(@PathVariable String id) {
        billRepository.deleteById(id);
    }
}
