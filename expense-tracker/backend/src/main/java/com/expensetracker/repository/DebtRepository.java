package com.expensetracker.repository;

import com.expensetracker.model.Debt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DebtRepository extends MongoRepository<Debt, String> {
    List<Debt> findByUserId(String userId);
}
