import React from 'react';
import { Expense, Category, UserSettings } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { COLORS } from '../constants';

interface ReportsProps {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
}

const Reports: React.FC<ReportsProps> = ({ expenses, categories, settings }) => {
  // Aggregate data for Pie Chart (Category-wise)
  const categoryData = categories.map(cat => {
    const total = expenses
      .filter(e => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name: cat.name, value: total, color: cat.color };
  }).filter(d => d.value > 0);

  // Aggregate data for Bar Chart (Daily - Last 7 days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const dailyData = getLast7Days().map(dateStr => {
    const total = expenses
      .filter(e => e.date.startsWith(dateStr))
      .reduce((sum, e) => sum + e.amount, 0);
    const dateObj = new Date(dateStr);
    return {
      day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: total
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
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
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data available</div>
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
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Last 7 Days</h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
              <Tooltip 
                cursor={{fill: '#F3F4F6'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                formatter={(value: number) => [`${settings.currencySymbol}${value}`, 'Spent']}
              />
              <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
