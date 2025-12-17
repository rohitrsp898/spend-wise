import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, List, PieChart, Settings, Sparkles, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  userPhoto?: string | null;
  userName?: string | null;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, userPhoto, userName, onLogout }) => {
  const navItems: { view: ViewState; label: string; icon: React.ReactNode }[] = [
    { view: 'DASHBOARD', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { view: 'EXPENSES', label: 'List', icon: <List size={20} /> },
    { view: 'REPORTS', label: 'Reports', icon: <PieChart size={20} /> },
    { view: 'AI_INSIGHTS', label: 'AI Tips', icon: <Sparkles size={20} /> },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 text-slate-900">
      {/* Header */}
      <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center sticky top-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          SpendWise
        </h1>
        <div className="flex items-center gap-3">
          {userPhoto && (
            <img src={userPhoto} alt="Profile" className="w-8 h-8 rounded-full border border-gray-100 shadow-sm" />
          )}
          <button
            onClick={() => onNavigate('SETTINGS')}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${activeView === 'SETTINGS' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
          >
            <Settings size={20} />
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-24">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full z-20 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-3xl mx-auto">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeView === item.view
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <div className={`p-1 rounded-xl transition-all ${activeView === item.view ? 'bg-blue-50' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
