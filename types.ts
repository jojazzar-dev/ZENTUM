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
  name: string;
  password?: string;
  dob?: string;
  nationality?: string;
  phone?: string;
  forexBalance: number;
  cryptoBalance: number;
  role: 'USER' | 'ADMIN';
}