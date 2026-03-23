import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:8080/api/expenses';

const getUserId = () => authService.getCurrentUser()?.id;

const headers = () => ({ headers: { 'X-User-Id': getUserId() } });

const expenseService = {
    getAllExpenses: () => axios.get(API_BASE_URL, headers()),
    getExpenseById: (id) => axios.get(`${API_BASE_URL}/${id}`, headers()),
    createExpense: (expense) => axios.post(API_BASE_URL, expense, headers()),
    updateExpense: (id, expense) => axios.put(`${API_BASE_URL}/${id}`, expense, headers()),
    deleteExpense: (id) => axios.delete(`${API_BASE_URL}/${id}`, headers()),
    getExpensesByCategory: (category) => axios.get(`${API_BASE_URL}/category/${category}`, headers()),
    getMonthlySummary: () => axios.get(`${API_BASE_URL}/monthly-summary`, headers())
};

export default expenseService;
