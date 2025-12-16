import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Reports from './components/Reports';
import SettingsView from './components/Settings';
import AIAdvisor from './components/AIAdvisor';
import { ViewState, Expense, Category, UserSettings } from './types';
import * as storage from './utils/storage';
import { auth } from './utils/firebase';
import * as firebaseAuth from 'firebase/auth';
import { DEFAULT_SETTINGS } from './constants';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  // State initialization
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<any>(null);
  
  // Edit/Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Authentication & Data Subscription
  useEffect(() => {
    // 1. Listen for Auth State
    const unsubAuth = firebaseAuth.onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthReady(true);
        setAuthError(null);
      } else {
        // 2. Sign in anonymously if not authenticated
        firebaseAuth.signInAnonymously(auth).catch((error) => {
          console.error("Authentication failed:", error);
          setAuthError(error);
        });
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    // 3. Only subscribe to data when authenticated
    if (!isAuthReady) return;

    const unsubExpenses = storage.subscribeExpenses(setExpenses);
    const unsubCategories = storage.subscribeCategories(setCategories);
    const unsubSettings = storage.subscribeSettings(setSettings);

    return () => {
      unsubExpenses();
      unsubCategories();
      unsubSettings();
    };
  }, [isAuthReady]);

  // Handlers
  const handleSaveExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
        if (editingExpense) {
            // Update existing
            await storage.updateExpense({ ...expenseData, id: editingExpense.id });
        } else {
            // Create new
            await storage.addExpense(expenseData);
        }
    } catch (error) {
        console.error("Error saving expense:", error);
        alert("Failed to save expense. Please check your connection.");
    }
    
    // Reset state
    setShowAddModal(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
        await storage.deleteExpense(id);
    } catch (error) {
        console.error("Error deleting expense:", error);
    }
  };

  const handleUpdateCategories = async (newCategories: Category[]) => {
      // Find deleted categories
      const currentIds = categories.map(c => c.id);
      const newIds = newCategories.map(c => c.id);
      const deletedIds = currentIds.filter(id => !newIds.includes(id));

      // Handle Deletions
      for (const id of deletedIds) {
          await storage.deleteCategory(id);
      }

      // Handle Updates/Additions
      for (const cat of newCategories) {
          await storage.addCategory(cat);
      }
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setShowAddModal(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  // View Routing
  const renderContent = () => {
    if (authError) {
      const isConfigError = authError.code === 'auth/admin-restricted-operation' || authError.message?.includes('admin-restricted');
      
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center animate-in fade-in duration-500">
          <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4 shadow-sm">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
             {isConfigError 
               ? "Anonymous authentication is not enabled in your Firebase project." 
               : "We couldn't sign you in. Please check your internet connection."}
          </p>
          
          {isConfigError && (
             <div className="bg-white p-5 rounded-xl border border-gray-200 text-left text-sm text-gray-700 shadow-sm max-w-sm w-full mb-6">
                <p className="font-bold text-gray-900 mb-2">Action Required:</p>
                <ol className="list-decimal pl-5 space-y-1.5">
                   <li>Go to the <strong>Firebase Console</strong></li>
                   <li>Click <strong>Authentication</strong> &gt; <strong>Sign-in method</strong></li>
                   <li>Select <strong>Anonymous</strong></li>
                   <li>Toggle to <strong>Enable</strong> and Save</li>
                </ol>
             </div>
          )}

          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    if (!isAuthReady) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 gap-4">
          <Loader2 className="animate-spin" size={40} />
          <p>Connecting to secure storage...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'DASHBOARD':
        return <Dashboard expenses={expenses} categories={categories} settings={settings} />;
      case 'EXPENSES':
        return <ExpenseList expenses={expenses} categories={categories} settings={settings} onDelete={handleDeleteExpense} onEdit={openEditModal} />;
      case 'REPORTS':
        return <Reports expenses={expenses} categories={categories} settings={settings} />;
      case 'AI_INSIGHTS':
        return <AIAdvisor expenses={expenses} categories={categories} settings={settings} />;
      case 'SETTINGS':
        return <SettingsView 
            settings={settings} 
            categories={categories} 
            onUpdateSettings={storage.saveSettings} 
            onUpdateCategories={handleUpdateCategories} 
        />;
      default:
        return <Dashboard expenses={expenses} categories={categories} settings={settings} />;
    }
  };

  return (
    <Layout activeView={activeView} onNavigate={setActiveView}>
      {renderContent()}

      {/* Floating Add Button */}
      {activeView !== 'SETTINGS' && isAuthReady && !authError && (
        <button
          onClick={openAddModal}
          className="fixed right-6 bottom-24 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-300 transition-all hover:scale-110 z-30"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Add/Edit Expense Modal */}
      {showAddModal && (
        <ExpenseForm 
          categories={categories}
          initialData={editingExpense || undefined}
          onSubmit={handleSaveExpense}
          onCancel={() => {
              setShowAddModal(false);
              setEditingExpense(null);
          }}
          currencySymbol={settings.currencySymbol}
        />
      )}
    </Layout>
  );
};

export default App;