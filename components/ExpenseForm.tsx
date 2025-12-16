import React, { useState } from 'react';
import { Category, Expense, PaymentMethod } from '../types';
import { X, Calendar, DollarSign, Tag, CreditCard, AlignLeft } from 'lucide-react';

interface ExpenseFormProps {
  categories: Category[];
  initialData?: Partial<Expense>;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
  currencySymbol: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  categories, 
  initialData, 
  onSubmit, 
  onCancel,
  currencySymbol
}) => {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  // Format initial date to YYYY-MM-DD for the input
  const getInitialDateStr = () => {
    if (initialData?.date) {
      return new Date(initialData.date).toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD
    }
    return new Date().toLocaleDateString('en-CA');
  };
  const [date, setDate] = useState(getInitialDateStr());
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.paymentMethod || PaymentMethod.CASH);
  const [merchant, setMerchant] = useState(initialData?.merchant || '');
  const [note, setNote] = useState(initialData?.note || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    // Construct the date object from the date picker (YYYY-MM-DD)
    // using local time components to avoid UTC offset issues
    const [y, m, d] = date.split('-').map(Number);
    const expenseDate = new Date(y, m - 1, d);

    // Add time component to ensure timestamp sorting works correctly
    // 1. If editing and the date hasn't changed (same day), preserve the original time.
    // 2. Otherwise (new expense or date changed), use current time.
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ms = now.getMilliseconds();

    if (initialData?.date) {
      const originalDate = new Date(initialData.date);
      // Check if the selected date matches the original date (ignoring time)
      if (originalDate.getFullYear() === y && 
          originalDate.getMonth() === m - 1 && 
          originalDate.getDate() === d) {
        hours = originalDate.getHours();
        minutes = originalDate.getMinutes();
        seconds = originalDate.getSeconds();
        ms = originalDate.getMilliseconds();
      }
    }

    expenseDate.setHours(hours, minutes, seconds, ms);

    onSubmit({
      amount: parseFloat(amount),
      date: expenseDate.toISOString(),
      categoryId,
      paymentMethod,
      merchant,
      note
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">
            {initialData?.amount ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount Input */}
          <div className="relative">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">{currencySymbol}</span>
              <input 
                type="number" 
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold text-gray-900 outline-none transition-all"
                placeholder="0.00"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Date */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Date</label>
              <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-blue-500 text-sm text-gray-700 outline-none cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select 
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-blue-500 text-sm text-gray-700 outline-none appearance-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-t-4 border-t-gray-400 border-x-4 border-x-transparent" />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Payment Method</label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {Object.values(PaymentMethod).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${
                    paymentMethod === method 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
             <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  value={merchant}
                  onChange={e => setMerchant(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-blue-500 text-sm text-gray-700 outline-none"
                  placeholder="Merchant / Payee (Optional)"
                />
            </div>
            <div className="relative">
                <AlignLeft className="absolute left-3 top-3 text-gray-400" size={16} />
                <textarea 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-blue-500 text-sm text-gray-700 outline-none resize-none"
                  placeholder="Notes (Optional)"
                  rows={2}
                />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-[0.98]"
          >
            {initialData?.amount ? 'Save Changes' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;