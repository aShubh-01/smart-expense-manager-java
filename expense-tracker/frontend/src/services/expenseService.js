import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/expenses';

const expenseService = {
    getAllExpenses: () => axios.get(API_BASE_URL),
    getExpenseById: (id) => axios.get(`${API_BASE_URL}/${id}`),
    createExpense: (expense) => axios.post(API_BASE_URL, expense),
    updateExpense: (id, expense) => axios.put(`${API_BASE_URL}/${id}`, expense),
    deleteExpense: (id) => axios.delete(`${API_BASE_URL}/${id}`),
    getExpensesByCategory: (category) => axios.get(`${API_BASE_URL}/category/${category}`),
    getMonthlySummary: () => axios.get(`${API_BASE_URL}/monthly-summary`)
};

export default expenseService;
