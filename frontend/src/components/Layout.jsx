// src/components/Layout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, User } from 'lucide-react';
import { useUser } from '../context/UserContext'; // <--- Import Hook

const Layout = ({ children }) => {
  const { balance } = useUser(); // <--- Get real balance
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-trade-accent/10 text-trade-accent border-r-2 border-trade-accent' 
            : 'text-gray-400 hover:bg-terminal-card hover:text-white'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-terminal-main text-gray-100 overflow-hidden">
      <aside className="w-64 border-r border-terminal-border flex flex-col">
        <div className="p-6 border-b border-terminal-border">
          <h1 className="text-2xl font-bold tracking-tighter text-trade-up">
            BLUE<span className="text-white">CHIP</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">The Attention Market</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/" icon={TrendingUp} label="Market Feed" />
          <NavItem to="/portfolio" icon={LayoutDashboard} label="Portfolio" />
          <NavItem to="/profile" icon={User} label="My Profile" />
        </nav>

        <div className="p-4 border-t border-terminal-border">
          <div className="bg-terminal-card p-4 rounded-lg border border-terminal-border">
            <p className="text-xs text-gray-500 mb-1">Your Buying Power</p>
            {/* Display Real Balance */}
            <p className="text-xl font-bold nums text-trade-up">
               ${balance ? balance.toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;