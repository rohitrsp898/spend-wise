import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { Expense, Category, UserSettings } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '../constants';

// We use a fixed document ID for settings since this is a single-user view for now.
// In a multi-user app, you would nest these under a user ID from Firebase Auth.
const SETTINGS_DOC_ID = 'user_settings';

// --- EXPENSES ---

export const subscribeExpenses = (onUpdate: (expenses: Expense[]) => void) => {
  const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Expense));
    onUpdate(expenses);
  });
};

export const addExpense = async (expense: Omit<Expense, 'id'>) => {
  // Create a new document reference with an auto-generated ID
  const newDocRef = doc(collection(db, 'expenses'));
  const newExpense: Expense = { ...expense, id: newDocRef.id };
  await setDoc(newDocRef, newExpense);
};

export const updateExpense = async (expense: Expense) => {
  if (!expense.id) return;
  const docRef = doc(db, 'expenses', expense.id);
  await setDoc(docRef, expense, { merge: true });
};

export const deleteExpense = async (id: string) => {
  await deleteDoc(doc(db, 'expenses', id));
};

// --- CATEGORIES ---

export const subscribeCategories = (onUpdate: (categories: Category[]) => void) => {
  return onSnapshot(collection(db, 'categories'), (snapshot) => {
    if (snapshot.empty) {
      // Seed default categories if database is empty
      DEFAULT_CATEGORIES.forEach(c => setDoc(doc(db, 'categories', c.id), c));
    } else {
      const categories = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Category));
      onUpdate(categories);
    }
  });
};

export const addCategory = async (category: Category) => {
  await setDoc(doc(db, 'categories', category.id), category);
};

export const updateCategoryList = async (categories: Category[]) => {
  // This function is kept for compatibility with the Settings component logic,
  // but ideally we should update individual categories. 
  // For now, we assume the UI handles the list state, and we just sync changes.
  // This is a naive implementation that just overwrites/adds. 
  // Deleting is harder with this signature, but sufficient for now.
  for (const cat of categories) {
    await setDoc(doc(db, 'categories', cat.id), cat);
  }
};

export const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, 'categories', id));
};

// --- SETTINGS ---

export const subscribeSettings = (onUpdate: (settings: UserSettings) => void) => {
  return onSnapshot(doc(db, 'settings', SETTINGS_DOC_ID), (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as UserSettings);
    } else {
      // Create default settings if not exists
      setDoc(doc(db, 'settings', SETTINGS_DOC_ID), DEFAULT_SETTINGS);
      onUpdate(DEFAULT_SETTINGS);
    }
  });
};

export const saveSettings = async (settings: UserSettings) => {
  await setDoc(doc(db, 'settings', SETTINGS_DOC_ID), settings);
};
