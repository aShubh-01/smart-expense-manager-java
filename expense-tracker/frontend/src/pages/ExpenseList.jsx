import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Edit2, Trash2, MoreVertical, Download } from 'lucide-react';
import expenseService from '../services/expenseService.js';

const ExpenseList = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Rent', 'Entertainment', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    let result = expenses;
    
    if (searchTerm) {
      result = result.filter(exp => 
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'All') {
      result = result.filter(exp => exp.category === categoryFilter);
    }

    setFilteredExpenses(result);
  }, [searchTerm, categoryFilter, expenses]);

  const fetchExpenses = async () => {
    try {
      const res = await expenseService.getAllExpenses();
      setExpenses(res.data);
      setFilteredExpenses(res.data);
    } catch (error) {
      console.error("Error fetching expenses", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await expenseService.deleteExpense(id);
        setExpenses(expenses.filter(exp => exp.id !== id));
      } catch (error) {
        console.error("Error deleting expense", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Expense History</h2>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => navigate('/add')}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all"
          >
            + New Expense
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium outline-none"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 py-4 font-semibold">Title</th>
                <th className="px-4 py-4 font-semibold">Category</th>
                <th className="px-4 py-4 font-semibold">Payment</th>
                <th className="px-4 py-4 font-semibold">Date</th>
                <th className="px-4 py-4 font-semibold">Amount</th>
                <th className="px-4 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-10 text-center text-gray-400">Loading expenses...</td></tr>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-4">
                      <p className="font-bold text-sm">{expense.title}</p>
                      {expense.description && <p className="text-xs text-gray-400 truncate max-w-[200px]">{expense.description}</p>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{expense.paymentMethod}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{expense.date}</td>
                    <td className="px-4 py-4 font-bold text-expense">₹{expense.amount}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/edit/${expense.id}`)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-gray-400 hover:text-expense hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-4 py-10 text-center text-gray-400">No expenses found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    Food: 'bg-blue-50 text-blue-600',
    Transport: 'bg-purple-50 text-purple-600',
    Shopping: 'bg-orange-50 text-orange-600',
    Bills: 'bg-red-50 text-red-600',
    Rent: 'bg-green-50 text-green-600',
    Entertainment: 'bg-pink-50 text-pink-600',
    Other: 'bg-gray-50 text-gray-600'
  };
  return colors[category] || colors.Other;
};

export default ExpenseList;
