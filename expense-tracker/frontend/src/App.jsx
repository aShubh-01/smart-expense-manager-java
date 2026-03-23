import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddExpense from './pages/AddExpense.jsx';
import ExpenseList from './pages/ExpenseList.jsx';
import Analytics from './pages/Analytics.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import FinanceManager from './pages/FinanceManager.jsx';
import FinancialConsultant from './pages/FinancialConsultant.jsx';
import authService from './services/authService';

const ProtectedRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><ExpenseList /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute><FinanceManager /></ProtectedRoute>} />
        <Route path="/consultant" element={<ProtectedRoute><FinancialConsultant /></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
