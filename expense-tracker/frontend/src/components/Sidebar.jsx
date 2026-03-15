import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, PieChart, Wallet } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Add Expense', icon: PlusCircle, path: '/add' },
    { name: 'Expense List', icon: List, path: '/expenses' },
    { name: 'Analytics', icon: PieChart, path: '/analytics' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-primary p-2 rounded-lg">
          <Wallet className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-primary">Expensy</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-gray-500 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-6 mt-auto">
        <div className="bg-blue-50 p-4 rounded-2xl">
          <p className="text-xs text-blue-600 font-semibold mb-1 uppercase">Pro Plan</p>
          <p className="text-sm text-gray-700 mb-3">Get unlimited insights and reports.</p>
          <button className="w-full bg-white text-primary text-sm font-bold py-2 rounded-lg shadow-sm">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
