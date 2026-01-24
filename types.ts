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
  password?: string;
  name: string;
  forexBalance: number;
  cryptoBalance: number;
  role: 'USER' | 'ADMIN';
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