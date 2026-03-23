import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, PieChart, Wallet, LogOut, Shield, MessageSquareText } from 'lucide-react';
import authService from '../services/authService';

const Sidebar = () => {
  const navigate = useNavigate();
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Add Expense', icon: PlusCircle, path: '/add' },
    { name: 'Expense List', icon: List, path: '/expenses' },
    { name: 'Analytics', icon: PieChart, path: '/analytics' },
    { name: 'Wealth Guard', icon: Shield, path: '/finance' },
    { name: 'AI Consultant', icon: MessageSquareText, path: '/consultant' },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    window.location.reload();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-primary p-2 rounded-lg">
          <Wallet className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tighter">Vance</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4 text-gray-600">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-300'
                  : 'text-gray-500 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6 mt-auto border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
