export enum PaymentMethod {
  CASH = 'Cash',
  UPI = 'UPI',
  CARD = 'Card',
  WALLET = 'Wallet',
}

export interface Expense {
  id: string;
  amount: number;
  date: string; // ISO string
  categoryId: string;
  paymentMethod: PaymentMethod;
  merchant?: string;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  budget: number; // 0 means no limit
}

export interface UserSettings {
  currencySymbol: string;
  monthlyBudget: number;
  isDarkMode: boolean;
}

export interface DailyTotal {
  date: string;
  total: number;
}

export interface CategoryTotal {
  name: string;
  value: number;
  color: string;
}

export type ViewState = 'DASHBOARD' | 'EXPENSES' | 'REPORTS' | 'SETTINGS' | 'AI_INSIGHTS';
