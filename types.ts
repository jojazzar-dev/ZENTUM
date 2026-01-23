export enum MarketType {
  FOREX = 'FOREX',
  CRYPTO = 'CRYPTO'
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  type: MarketType;
}

export interface User {
  id: string;
  email: string;
  password?: string;   // أضفنا حقل كلمة المرور
  name: string;
  dob?: string;         // جعلناه اختيارياً (علامة ?) لعدم تعليق الكود
  nationality?: string; // اختياري
  phone?: string;       // اختياري
  forexBalance: number;
  cryptoBalance: number;
  role: 'USER' | 'ADMIN';
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: number;
  marketType: MarketType;
}