import React, { useState } from 'react';
import { UserSettings, Category } from '../types';
import { Save, Plus, Trash2, User as UserIcon } from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  categories: Category[];
  onUpdateSettings: (s: UserSettings) => void;
  onUpdateCategories: (c: Category[]) => void;
  user?: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null;
}

const SettingsView: React.FC<SettingsProps> = ({ settings, categories, onUpdateSettings, onUpdateCategories, user }) => {
  const [budget, setBudget] = useState(settings.monthlyBudget.toString());
  const [currency, setCurrency] = useState(settings.currencySymbol);
  const [newCatName, setNewCatName] = useState('');

  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      monthlyBudget: parseFloat(budget) || 0,
      currencySymbol: currency,
    });
    alert('Settings saved!');
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: Date.now().toString(),
      name: newCatName,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      budget: 0
    };
    onUpdateCategories([...categories, newCat]);
    setNewCatName('');
  };

  const removeCategory = (id: string) => {
    if (confirm('Delete this category?')) {
      onUpdateCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">

      {/* User Profile Card */}
      {user && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden border-2 border-white shadow-sm">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={32} />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.displayName || 'User'}</h2>
            <p className="text-sm text-gray-500">{user.email || 'No email associated'}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">General Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Monthly Budget</label>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className="w-full mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
              <option value="₹">INR (₹)</option>
              <option value="¥">JPY (¥)</option>
              <option value="C$">CAD (C$)</option>
              <option value="A$">AUD (A$)</option>
            </select>
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <Save size={18} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Categories</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            placeholder="New Category Name"
            className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 text-sm"
          />
          <button
            onClick={addCategory}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              </div>
              <button
                onClick={() => removeCategory(cat.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
