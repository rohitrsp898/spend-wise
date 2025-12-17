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

const SETTINGS_DOC_ID = 'user_settings';

// --- HELPERS ---
const getUserCollection = (userId: string, collectionName: string) => {
  return collection(db, 'users', userId, collectionName);
};

const getUserDoc = (userId: string, collectionName: string, docId: string) => {
  return doc(db, 'users', userId, collectionName, docId);
};

// --- EXPENSES ---

export const subscribeExpenses = (userId: string, onUpdate: (expenses: Expense[]) => void) => {
  const q = query(getUserCollection(userId, 'expenses'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Expense));
    onUpdate(expenses);
  });
};

export const addExpense = async (userId: string, expense: Omit<Expense, 'id'>) => {
  const newDocRef = doc(getUserCollection(userId, 'expenses'));
  const newExpense: Expense = { ...expense, id: newDocRef.id };
  await setDoc(newDocRef, newExpense);
};

export const updateExpense = async (userId: string, expense: Expense) => {
  if (!expense.id) return;
  const docRef = getUserDoc(userId, 'expenses', expense.id);
  await setDoc(docRef, expense, { merge: true });
};

export const deleteExpense = async (userId: string, id: string) => {
  await deleteDoc(getUserDoc(userId, 'expenses', id));
};

// --- CATEGORIES ---

export const subscribeCategories = (userId: string, onUpdate: (categories: Category[]) => void) => {
  return onSnapshot(getUserCollection(userId, 'categories'), (snapshot) => {
    if (snapshot.empty) {
      // Seed default categories for this new user
      DEFAULT_CATEGORIES.forEach(c => setDoc(getUserDoc(userId, 'categories', c.id), c));
    } else {
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      onUpdate(categories);
    }
  });
};

export const addCategory = async (userId: string, category: Category) => {
  await setDoc(getUserDoc(userId, 'categories', category.id), category);
};

export const updateCategoryList = async (userId: string, categories: Category[]) => {
  for (const cat of categories) {
    await setDoc(getUserDoc(userId, 'categories', cat.id), cat);
  }
};

export const deleteCategory = async (userId: string, id: string) => {
  await deleteDoc(getUserDoc(userId, 'categories', id));
};

// --- SETTINGS ---

export const subscribeSettings = (userId: string, onUpdate: (settings: UserSettings) => void) => {
  return onSnapshot(getUserDoc(userId, 'settings', SETTINGS_DOC_ID), (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as UserSettings);
    } else {
      // Create default settings if not exists
      setDoc(getUserDoc(userId, 'settings', SETTINGS_DOC_ID), DEFAULT_SETTINGS);
      onUpdate(DEFAULT_SETTINGS);
    }
  });
};

export const saveSettings = async (userId: string, settings: UserSettings) => {
  await setDoc(getUserDoc(userId, 'settings', SETTINGS_DOC_ID), settings);
};
