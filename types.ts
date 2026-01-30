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

// 3. هيكل الصفقات التاريخية (History)
export interface HistoryOrder {
  id: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  openPrice: number;
  closePrice: number; 
  volume: number;    
  profit: number;    
  timestamp: number; 
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
  emailVerified: boolean; 
  createdAt: number;      
  forexOrders?: ForexOrder[];
  cryptoHoldings?: CryptoHolding[];
  tradeHistory?: HistoryOrder[]; 
}

// واجهة طلبات الإيداع
export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  coin: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: number;
}

// --- الجديد: واجهة طلبات السحب (Withdrawal System) ---
export interface WithdrawRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  walletAddress: string; // عنوان محفظة العميل الذي يريد الاستلام عليها
  network: string;       // الشبكة (مثل TRC20 أو ERC20)
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: number;
}