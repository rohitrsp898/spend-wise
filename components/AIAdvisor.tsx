import React, { useState } from 'react';
import { Expense, Category, UserSettings } from '../types';
import { generateFinancialInsights } from '../services/geminiService';
import { Sparkles, Lock, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  expenses: Expense[];
  categories: Category[];
  settings: UserSettings;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ expenses, categories, settings }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateFinancialInsights(expenses, categories, settings.currencySymbol);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-10 -mb-10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles size={24} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Financial Advisor</h2>
              <p className="text-purple-200 text-sm">Smart insights powered by Gemini</p>
            </div>
          </div>
          
          <p className="text-purple-100 text-sm mb-6 leading-relaxed">
            Get personalized advice on your spending habits, budget allocation, and potential savings. 
            We analyze your categorized expenses locally before sending an anonymized summary to the AI.
          </p>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-white text-purple-700 font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCcw className="animate-spin" size={18} />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Generate Insights</span>
            )}
          </button>
        </div>
      </div>

      {insight && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            Analysis Result
          </h3>
          <div className="prose prose-sm prose-purple text-gray-600">
            <ReactMarkdown>{insight}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 p-4 bg-gray-100 rounded-xl">
        <Lock className="text-gray-400 mt-0.5" size={16} />
        <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Privacy Notice:</strong> When you generate insights, only aggregated totals by category are sent to the AI service. No specific transaction details, merchant names, or personal notes are shared.
        </p>
      </div>
    </div>
  );
};

export default AIAdvisor;
