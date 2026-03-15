import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddExpense from './pages/AddExpense.jsx';
import ExpenseList from './pages/ExpenseList.jsx';
import Analytics from './pages/Analytics.jsx';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddExpense />} />
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/edit/:id" element={<AddExpense />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
