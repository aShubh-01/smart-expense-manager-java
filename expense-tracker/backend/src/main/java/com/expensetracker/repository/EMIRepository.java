package com.expensetracker.repository;

import com.expensetracker.model.EMI;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EMIRepository extends MongoRepository<EMI, String> {
    List<EMI> findByUserId(String userId);
}
