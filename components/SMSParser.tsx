import React, { useState } from 'react';
import { Category, Expense, PaymentMethod } from '../types';
import { MessageSquare, ArrowRight, Check, AlertTriangle, Copy } from 'lucide-react';

interface SMSParserProps {
  categories: Category[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  currencySymbol: string;
}

const SMSParser: React.FC<SMSParserProps> = ({ categories, onAddExpense, currencySymbol }) => {
  const [text, setText] = useState('');
  const [parsedData, setParsedData] = useState<Partial<Expense> | null>(null);

  const parseText = () => {
    // Basic Regex patterns to simulate bank SMS parsing
    // Looks for patterns like "Spent Rs 500", "Debited INR 500", "Paid 500"
    const amountRegex = /(?:spent|debited|paid|txn|amt|amount)(?:\s+of)?\s*(?:rs\.?|inr|usd|\$)?\s*([\d,]+(?:\.\d{2})?)/i;
    const merchantRegex = /(?:at|to|for)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:on|using|via|ref|bal)|$)/i;
    // Date parsing is tricky with regex alone, defaulting to today if not found or complex
    
    const amountMatch = text.match(amountRegex);
    const merchantMatch = text.match(merchantRegex);

    if (amountMatch) {
      const amountStr = amountMatch[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      const merchant = merchantMatch ? merchantMatch[1].trim() : 'Unknown Merchant';
      
      // Auto-categorize based on keywords in merchant/text
      let categoryId = categories[categories.length - 1].id; // Default to 'Other'
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('swiggy') || lowerText.includes('zomato') || lowerText.includes('food')) {
        categoryId = categories.find(c => c.name === 'Food')?.id || categoryId;
      } else if (lowerText.includes('uber') || lowerText.includes('ola') || lowerText.includes('fuel')) {
        categoryId = categories.find(c => c.name === 'Travel')?.id || categoryId;
      } else if (lowerText.includes('netflix') || lowerText.includes('movie')) {
        categoryId = categories.find(c => c.name === 'Entertainment')?.id || categoryId;
      }

      setParsedData({
        amount,
        merchant,
        date: new Date().toISOString(),
        categoryId,
        paymentMethod: PaymentMethod.CARD, // Assumption
        note: 'Auto-parsed from text'
      });
    } else {
      setParsedData(null);
      alert('Could not detect transaction amount. Please ensure the text contains keywords like "spent", "paid", or "debited".');
    }
  };

  const confirmExpense = () => {
    if (parsedData && parsedData.amount && parsedData.categoryId) {
      onAddExpense(parsedData as Omit<Expense, 'id'>);
      setText('');
      setParsedData(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Text Parser</h2>
            <p className="text-xs text-gray-500">Paste bank SMS or transaction text to auto-add.</p>
          </div>
        </div>

        <div className="relative">
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none resize-none transition-all"
            rows={4}
            placeholder="e.g. Spent Rs 450 at Starbucks on 12-08-2023..."
            />
            {text && (
                <button 
                    onClick={() => setText('')}
                    className="absolute top-2 right-2 text-xs text-gray-400 hover:text-red-500 px-2 py-1"
                >
                    Clear
                </button>
            )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={parseText}
            disabled={!text}
            className="flex items-center gap-2 bg-blue-600 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            <span>Detect Expense</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {parsedData && (
        <div className="bg-green-50 border border-green-200 rounded-3xl p-6 animate-in slide-in-from-bottom-2">
          <h3 className="text-green-800 font-bold mb-4 flex items-center gap-2">
            <Check size={18} /> Expense Detected
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-green-100">
              <span className="text-green-700 text-sm">Amount</span>
              <span className="font-bold text-green-900 text-lg">{currencySymbol}{parsedData.amount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-green-100">
              <span className="text-green-700 text-sm">Merchant</span>
              <span className="font-medium text-green-900">{parsedData.merchant}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-green-100">
              <span className="text-green-700 text-sm">Category</span>
              <select 
                value={parsedData.categoryId}
                onChange={(e) => setParsedData({...parsedData, categoryId: e.target.value})}
                className="bg-white border border-green-300 text-green-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-1.5"
              >
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
                onClick={() => setParsedData(null)}
                className="flex-1 py-3 text-green-700 font-medium hover:bg-green-100 rounded-xl transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={confirmExpense}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-colors"
            >
                Confirm & Add
            </button>
          </div>
        </div>
      )}

        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3">
            <AlertTriangle className="text-orange-500 shrink-0" size={20} />
            <div>
                <h4 className="text-sm font-bold text-orange-800">Privacy Note</h4>
                <p className="text-xs text-orange-700 mt-1">
                    Parsing happens 100% locally on your device. We do not send your message content to any server.
                </p>
            </div>
        </div>
    </div>
  );
};

export default SMSParser;
