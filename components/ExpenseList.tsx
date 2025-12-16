import React, { useState } from 'react';
import { Expense, Category, UserSettings } from '../types';
import { Trash2, Search, ChevronLeft, ChevronRight, Calendar, X, Check } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, categories, settings, onDelete, onEdit }) => {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter by Month and Year
  const filtered = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    const matchesMonth = expenseDate.getMonth() === selectedDate.getMonth();
    const matchesYear = expenseDate.getFullYear() === selectedDate.getFullYear();
    const matchesSearch = e.merchant?.toLowerCase().includes(search.toLowerCase()) || 
                          categories.find(c => c.id === e.categoryId)?.name.toLowerCase().includes(search.toLowerCase());
    
    return matchesMonth && matchesYear && matchesSearch;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const changeMonth = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
    setConfirmDeleteId(null); // Reset delete state when changing month
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setConfirmDeleteId(current => current === id ? null : current), 3000);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const monthName = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const totalForMonth = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* Month Selector / Calendar Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col items-center">
                <span className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" />
                    {monthName}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                    Total: {settings.currencySymbol}{totalForMonth.toLocaleString()}
                </span>
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                <ChevronRight size={20} />
            </button>
        </div>

        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search this month..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
        </div>
      </div>

      <div className="space-y-3 pb-20">
        {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                <Calendar size={32} className="opacity-20" />
                <p>No expenses for {monthName}</p>
            </div>
        ) : (
            filtered.map(expense => {
                const category = categories.find(c => c.id === expense.categoryId);
                const isDeleting = confirmDeleteId === expense.id;

                return (
                    <div 
                        key={expense.id} 
                        onClick={() => !isDeleting && onEdit(expense)}
                        className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center transition-colors ${!isDeleting ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                                style={{ backgroundColor: category?.color || '#ccc' }}
                            >
                                {(category?.name[0] || '?')}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{expense.merchant || category?.name}</p>
                                <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{expense.paymentMethod}</span>
                                </div>
                                {expense.note && <p className="text-xs text-gray-400 mt-1 italic line-clamp-1">{expense.note}</p>}
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                            <span className="font-bold text-gray-900">
                                -{settings.currencySymbol}{expense.amount.toLocaleString()}
                            </span>
                            
                            {isDeleting ? (
                                <div className="flex items-center gap-1 animate-in slide-in-from-right duration-200">
                                    <button 
                                        onClick={handleCancelDelete}
                                        className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                                    >
                                        <X size={16} />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeleteClick(e, expense.id)}
                                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm"
                                    >
                                        <Check size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={(e) => handleDeleteClick(e, expense.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                                    aria-label="Delete expense"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default ExpenseList;