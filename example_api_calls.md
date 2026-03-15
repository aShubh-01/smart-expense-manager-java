# Smart Expense Tracker API Examples

Base URL: `http://localhost:8080/api/expenses`

### 1. Create Expense
**POST** `/api/expenses`
```json
{
  "title": "Dinner at Taj",
  "amount": 2500.0,
  "category": "Food",
  "description": "Weekend dinner with family",
  "paymentMethod": "Card",
  "date": "2024-05-15"
}
```

### 2. Get All Expenses
**GET** `/api/expenses`

### 3. Get Expense by ID
**GET** `/api/expenses/{id}`

### 4. Update Expense
**PUT** `/api/expenses/{id}`
```json
{
  "title": "Dinner at Taj (Updated)",
  "amount": 2600.0,
  "category": "Food",
  "description": "Weekend dinner with family - adjusted price",
  "paymentMethod": "UPI",
  "date": "2024-05-15"
}
```

### 5. Delete Expense
**DELETE** `/api/expenses/{id}`

### 6. Filter by Category
**GET** `/api/expenses/category/Shopping`

### 7. Get Monthly Summary (Aggregated)
**GET** `/api/expenses/monthly-summary`
Returns:
```json
[
  { "category": "Food", "totalAmount": 5400.0 },
  { "category": "Transport", "totalAmount": 1200.0 }
]
```
