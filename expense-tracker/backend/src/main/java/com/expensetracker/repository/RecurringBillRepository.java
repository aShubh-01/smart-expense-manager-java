package com.expensetracker.repository;

import com.expensetracker.model.RecurringBill;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecurringBillRepository extends MongoRepository<RecurringBill, String> {
    List<RecurringBill> findByUserId(String userId);
}
