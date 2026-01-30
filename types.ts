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

// 1. هيكل صفقات الفوركس النشطة
export interface ForexOrder {
  id: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  openPrice: number;
  volume: number;
}

// 2. هيكل أصول الكريبتو المملوكة
export interface CryptoHolding {
  id: number;
  symbol: string;
  qty: number;
  buyPrice: number;
}

// 3. هيكل الصفقات التاريخية (History) - جديد
export interface HistoryOrder {
  id: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  openPrice: number;
  closePrice: number; // السعر عند الإغلاق
  volume: number;    // الكمية أو اللوت
  profit: number;    // الربح أو الخسارة النهائية
  timestamp: number; // وقت الإغلاق
  marketType: MarketType;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  forexBalance: number;
  cryptoBalance: number;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean; // حالة تأكيد الإيميل - جديد
  createdAt: number;      // تاريخ إنشاء الحساب - جديد
  forexOrders?: ForexOrder[];
  cryptoHoldings?: CryptoHolding[];
  tradeHistory?: HistoryOrder[]; // مصفوفة السجل التاريخي - جديد
}

export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  coin: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: number;
}