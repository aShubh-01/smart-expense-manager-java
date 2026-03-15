import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Loader2 } from 'lucide-react';
import expenseService from '../services/expenseService.js';

const AddExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    paymentMethod: 'UPI',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Rent', 'Entertainment', 'Other'];
  const paymentMethods = ['Cash', 'Card', 'UPI'];

  useEffect(() => {
    if (id) {
      const fetchExpense = async () => {
        setFetching(true);
        try {
          const res = await expenseService.getExpenseById(id);
          setFormData(res.data);
        } catch (error) {
          console.error("Error fetching expense", error);
        } finally {
          setFetching(false);
        }
      };
      fetchExpense();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await expenseService.updateExpense(id, formData);
      } else {
        await expenseService.createExpense(formData);
      }
      navigate('/expenses');
    } catch (error) {
      console.error("Error saving expense", error);
      alert("Failed to save expense. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex items-center justify-center h-full">Loading expense details...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">{id ? 'Edit Expense' : 'Add New Expense'}</h2>
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Title</label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Grocery Shopping"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Amount (₹)</label>
            <input
              required
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none bg-white"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none bg-white"
            >
              {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Date</label>
          <input
            required
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Description (Optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Add some details..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>{id ? 'Update Expense' : 'Save Expense'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
