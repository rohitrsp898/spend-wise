import React, { useState, useMemo } from 'react';
import { Expense, Category, UserSettings } from '../types';
import { Wallet, TrendingDown, AlertCircle, Calendar, Filter, CreditCard } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard: React.FC<DashboardProps> = ({ expenses, categories, settings }) => {
  const [filterType, setFilterType] = useState<'this-month' | 'last-month' | 'custom'>('this-month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Calculate filtered expenses
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth(), 1);
    let end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    if (filterType === 'last-month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (filterType === 'custom' && customStart && customEnd) {
      start = new Date(customStart);
      end = new Date(customEnd);
      end.setHours(23, 59, 59);
    }

    return expenses.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });
  }, [expenses, filterType, customStart, customEnd]);

  // Calculations for statistics
  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = settings.monthlyBudget - totalSpent;
  const progress = Math.min((totalSpent / settings.monthlyBudget) * 100, 100);
  const isOverBudget = remaining < 0;

  // Data for Transaction Type Chart
  const expensesByType = useMemo(() => {
    const data: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      data[e.paymentMethod] = (data[e.paymentMethod] || 0) + e.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  // Recent transactions sorted by date
  const recentExpenses = [...filteredExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

      {/* Date Filter Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
          <Filter size={18} />
          <span>Filter Period</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('this-month')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${filterType === 'this-month' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            This Month
          </button>
          <button
            onClick={() => setFilterType('last-month')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${filterType === 'last-month' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Last Month
          </button>
          <button
            onClick={() => setFilterType('custom')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${filterType === 'custom' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Custom
          </button>
        </div>

        {filterType === 'custom' && (
          <div className="grid grid-cols-2 gap-3 mt-3 animate-in slide-in-from-top-2">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">From</label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">To</label>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          </div>
        )}
      </div>

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
            {filteredExpenses.length}
          </p>
        </div>
      </div>

      {/* Spend by Payment Method Chart */}
      {expensesByType.length > 0 && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 px-1 flex items-center gap-2">
            <CreditCard size={16} className="text-gray-500" />
            Spend by Method
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${settings.currencySymbol}${value.toLocaleString()}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3 px-1">Recent Activity</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {recentExpenses.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No expenses found for this period</div>
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
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{expense.paymentMethod}</span>
                      </div>
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