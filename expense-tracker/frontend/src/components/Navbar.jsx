import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
        <Search className="text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search something..."
          className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full"
        />
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-primary transition-colors">
          <Bell className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
