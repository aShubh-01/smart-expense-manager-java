import React, { useState, useEffect } from 'react';
import { TrendingUp, CreditCard, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import expenseService from '../services/expenseService.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, summaryRes] = await Promise.all([
          expenseService.getAllExpenses(),
          expenseService.getMonthlySummary()
        ]);
        setExpenses(expensesRes.data.slice(-5).reverse());
        setSummary(summaryRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalThisMonth = summary.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pieData = {
    labels: summary.map(s => s.category),
    datasets: [
      {
        data: summary.map(s => s.totalAmount),
        backgroundColor: [
          '#3B82F6', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'
        ],
        borderWidth: 0,
      },
    ],
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <p className="text-gray-500 text-sm">Welcome back, Shubham!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <TrendingUp className="text-primary w-6 h-6" />
            </div>
            <span className="flex items-center text-success text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +12.5%
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Expenses</p>
          <h3 className="text-3xl font-bold mt-1">₹{totalThisMonth.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <CreditCard className="text-purple-600 w-6 h-6" />
            </div>
            <span className="flex items-center text-expense text-xs font-bold bg-red-50 px-2 py-1 rounded-lg">
              <ArrowDownRight className="w-3 h-3 mr-1" /> -2.4%
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Active Subscriptions</p>
          <h3 className="text-3xl font-bold mt-1">12</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-2xl">
              <ShoppingBag className="text-orange-600 w-6 h-6" />
            </div>
            <span className="text-gray-400 text-xs font-medium">This Month</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Top Category</p>
          <h3 className="text-3xl font-bold mt-1">
            {summary.length > 0 ? summary.sort((a,b) => b.totalAmount - a.totalAmount)[0].category : 'N/A'}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Spending by Category</h3>
          <div className="h-64 flex items-center justify-center">
            {summary.length > 0 ? (
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            ) : (
              <p className="text-gray-400">No data available</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Recent Expenses</h3>
            <button className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-3 rounded-xl">
                    <Wallet className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{expense.title}</p>
                    <p className="text-xs text-gray-400">{expense.category} • {expense.date}</p>
                  </div>
                </div>
                <p className="font-bold text-expense">-₹{expense.amount}</p>
              </div>
            ))}
            {expenses.length === 0 && <p className="text-center text-gray-400 py-10">No recent expenses</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Wallet = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
);

export default Dashboard;
