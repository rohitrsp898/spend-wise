import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Reports from './components/Reports';
import SettingsView from './components/Settings';
import AIAdvisor from './components/AIAdvisor';
import Login from './components/Login';
import { ViewState, Expense, Category, UserSettings } from './types';
import * as storage from './utils/storage';
import { auth } from './utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { DEFAULT_SETTINGS } from './constants';
import { Plus, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // State initialization
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewState>('DASHBOARD');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Edit/Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Authentication & Data Subscription
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    // Only subscribe to data when authenticated
    if (!user) {
      setExpenses([]);
      setCategories([]);
      return;
    }

    const unsubExpenses = storage.subscribeExpenses(user.uid, setExpenses);
    const unsubCategories = storage.subscribeCategories(user.uid, setCategories);
    const unsubSettings = storage.subscribeSettings(user.uid, setSettings);

    return () => {
      unsubExpenses();
      unsubCategories();
      unsubSettings();
    };
  }, [user]);

  // Handlers
  const handleSaveExpense = async (expenseData: Omit<Expense, 'id'>) => {
    if (!user) return;
    try {
      if (editingExpense) {
        // Update existing
        await storage.updateExpense(user.uid, { ...expenseData, id: editingExpense.id });
      } else {
        // Create new
        await storage.addExpense(user.uid, expenseData);
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
    if (!user) return;
    try {
      await storage.deleteExpense(user.uid, id);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleUpdateCategories = async (newCategories: Category[]) => {
    if (!user) return;
    // Find deleted categories
    const currentIds = categories.map(c => c.id);
    const newIds = newCategories.map(c => c.id);
    const deletedIds = currentIds.filter(id => !newIds.includes(id));

    // Handle Deletions
    for (const id of deletedIds) {
      await storage.deleteCategory(user.uid, id);
    }

    // Handle Updates/Additions
    for (const cat of newCategories) {
      await storage.addCategory(user.uid, cat);
    }
  };

  const handleUpdateSettings = async (newSettings: UserSettings) => {
    if (!user) return;
    await storage.saveSettings(user.uid, newSettings);
  };

  const handleLogout = async () => {
    await auth.signOut();
    setActiveView('DASHBOARD');
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
    if (!isAuthReady) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-400 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p>Loading SpendWise...</p>
        </div>
      );
    }

    if (!user) {
      return <Login />;
    }

    const content = (() => {
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
            onUpdateSettings={handleUpdateSettings}
            onUpdateCategories={handleUpdateCategories}
          />;
        default:
          return <Dashboard expenses={expenses} categories={categories} settings={settings} />;
      }
    })();

    return (
      <Layout
        activeView={activeView}
        onNavigate={setActiveView}
        userPhoto={user.photoURL}
        userName={user.displayName}
        onLogout={handleLogout}
      >
        {content}

        {/* Floating Add Button */}
        {activeView !== 'SETTINGS' && (
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

  return renderContent();
};

export default App;