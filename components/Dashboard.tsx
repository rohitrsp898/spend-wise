import React from 'react';
import { Expense, Category, UserSettings } from '../types';
import { Wallet, TrendingDown, AlertCircle } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, categories, settings }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = settings.monthlyBudget - totalSpent;
  const progress = Math.min((totalSpent / settings.monthlyBudget) * 100, 100);
  
  const isOverBudget = remaining < 0;

  // Recent transactions sorted by date descending (latest on top)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Main Budget Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">Remaining Budget</p>
            <h2 className="text-4xl font-bold mt-1">
              {settings.currencySymbol}{Math.max(0, remaining).toLocaleString()}
            </h2>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
            <Wallet size={24} className="text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-blue-100">
            <span>Spent: {settings.currencySymbol}{totalSpent.toLocaleString()}</span>
            <span>Limit: {settings.currencySymbol}{settings.monthlyBudget.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-red-400' : 'bg-white'}`} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {isOverBudget && (
          <div className="mt-4 flex items-center gap-2 bg-red-500/20 p-2 rounded-lg border border-red-400/30">
            <AlertCircle size={16} className="text-red-200" />
            <span className="text-xs font-medium text-red-100">Budget exceeded by {settings.currencySymbol}{Math.abs(remaining).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <TrendingDown size={16} />
            <span className="text-xs font-medium">Daily Average</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {settings.currencySymbol}{(totalSpent / (new Date().getDate() || 1)).toFixed(0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <Wallet size={16} />
            <span className="text-xs font-medium">Transactions</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {monthlyExpenses.length}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3 px-1">Recent Activity</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {recentExpenses.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No expenses yet</div>
          ) : (
            recentExpenses.map(expense => {
              const category = categories.find(c => c.id === expense.categoryId);
              return (
                <div 
                  key={expense.id} 
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: category?.color || '#ccc' }}
                    >
                      {(category?.name[0] || '?')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{expense.merchant || category?.name}</p>
                      <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 text-sm">
                    -{settings.currencySymbol}{expense.amount.toLocaleString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;