import React, { useState, useMemo } from 'react';
import { Expense, Category, UserSettings } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { COLORS } from '../constants';
import { Filter } from 'lucide-react';

interface ReportsProps {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
}

const Reports: React.FC<ReportsProps> = ({ expenses, categories, settings }) => {
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

  // Aggregate data for Pie Chart (Category-wise)
  const categoryData = useMemo(() => {
    return categories.map(cat => {
      const total = filteredExpenses
        .filter(e => e.categoryId === cat.id)
        .reduce((sum, e) => sum + e.amount, 0);
      return { name: cat.name, value: total, color: cat.color };
    }).filter(d => d.value > 0);
  }, [filteredExpenses, categories]);

  // Aggregate data for Bar Chart (Daily Trend within the selected period)
  const dailyData = useMemo(() => {
    // If we have data, we want to show the trend over the available date range
    if (filteredExpenses.length === 0) return [];

    // Sort expenses by date
    const sorted = [...filteredExpenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Create a map to aggregate totals
    const daysMap = new Map<string, number>();

    sorted.forEach(e => {
      const dateStr = e.date.split('T')[0];
      daysMap.set(dateStr, (daysMap.get(dateStr) || 0) + e.amount);
    });

    // Convert map to array for chart
    return Array.from(daysMap.entries()).map(([dateStr, amount]) => {
      const dateObj = new Date(dateStr);
      return {
        day: dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        amount: amount,
        fullDate: dateStr
      };
    });

  }, [filteredExpenses]);


  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* Date Filter Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
          <Filter size={18} />
          <span>Filter Report Period</span>
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

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Spending by Category</h2>
        <div className="h-64 w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${settings.currencySymbol}${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No expenses for this period</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {categoryData.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="truncate flex-1">{item.name}</span>
              <span className="font-semibold">{settings.currencySymbol}{item.value.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Trend */}
      {dailyData.length > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Trend (Selected Period)</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} interval={'preserveStartEnd'} />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${settings.currencySymbol}${value}`, 'Spent']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
