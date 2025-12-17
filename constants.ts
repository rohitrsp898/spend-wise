import { Category, UserSettings } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food', color: '#e0bd0dff', budget: 0 },
  { id: '2', name: 'Travel', color: '#3B82F6', budget: 0 },
  { id: '3', name: 'Shopping', color: '#F59E0B', budget: 0 },
  { id: '4', name: 'Bills', color: '#10B981', budget: 0 },
  { id: '5', name: 'Entertainment', color: '#8B5CF6', budget: 0 },
  { id: '6', name: 'Others', color: '#6B7280', budget: 0 },
];

export const DEFAULT_SETTINGS: UserSettings = {
  currencySymbol: '₹',
  monthlyBudget: 15000,
  isDarkMode: false,
};

export const COLORS = [
  '#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
];
