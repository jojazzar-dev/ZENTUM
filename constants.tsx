
import React from 'react';
import { MarketType, MarketData } from './types';

export const APP_NAME = "ZENTUM";

export const INITIAL_FOREX_DATA: MarketData[] = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", price: 1.0842, change: +0.02, type: MarketType.FOREX },
  { symbol: "GBP/USD", name: "Pound / US Dollar", price: 1.2635, change: -0.15, type: MarketType.FOREX },
  { symbol: "USD/JPY", name: "US Dollar / Yen", price: 150.21, change: +0.45, type: MarketType.FOREX },
  { symbol: "AUD/USD", name: "Aussie / US Dollar", price: 0.6542, change: -0.08, type: MarketType.FOREX },
  { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", price: 0.8812, change: +0.12, type: MarketType.FOREX },
  { symbol: "NZD/USD", name: "NZ Dollar / US Dollar", price: 0.6123, change: +0.05, type: MarketType.FOREX },
  { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", price: 1.3542, change: -0.10, type: MarketType.FOREX },
  { symbol: "EUR/GBP", name: "Euro / Pound", price: 0.8542, change: +0.11, type: MarketType.FOREX },
  { symbol: "EUR/JPY", name: "Euro / Yen", price: 162.45, change: +0.32, type: MarketType.FOREX },
  { symbol: "GBP/JPY", name: "Pound / Yen", price: 189.21, change: +0.28, type: MarketType.FOREX },
  { symbol: "AUD/JPY", name: "Aussie / Yen", price: 98.45, change: -0.12, type: MarketType.FOREX },
  { symbol: "EUR/AUD", name: "Euro / Aussie", price: 1.6542, change: +0.08, type: MarketType.FOREX },
  { symbol: "EUR/CHF", name: "Euro / Swiss Franc", price: 0.9542, change: -0.05, type: MarketType.FOREX },
  { symbol: "GBP/CHF", name: "Pound / Swiss Franc", price: 1.1123, change: +0.15, type: MarketType.FOREX },
  { symbol: "CAD/JPY", name: "CAD / Yen", price: 110.42, change: +0.22, type: MarketType.FOREX },
  { symbol: "AUD/CAD", name: "Aussie / CAD", price: 0.8845, change: -0.05, type: MarketType.FOREX },
  { symbol: "AUD/NZD", name: "Aussie / NZ Dollar", price: 1.0654, change: +0.12, type: MarketType.FOREX },
  { symbol: "NZD/JPY", name: "NZ Dollar / Yen", price: 92.45, change: +0.18, type: MarketType.FOREX },
  { symbol: "EUR/NZD", name: "Euro / NZ Dollar", price: 1.7645, change: -0.05, type: MarketType.FOREX },
  { symbol: "GBP/AUD", name: "Pound / Aussie", price: 1.9321, change: +0.10, type: MarketType.FOREX },
  { symbol: "GBP/NZD", name: "Pound / NZ Dollar", price: 2.0654, change: +0.15, type: MarketType.FOREX },
  { symbol: "USD/MXN", name: "US Dollar / Mexico Peso", price: 17.054, change: -0.45, type: MarketType.FOREX },
  { symbol: "USD/ZAR", name: "US Dollar / SA Rand", price: 19.123, change: +0.55, type: MarketType.FOREX },
  { symbol: "USD/TRY", name: "US Dollar / Turkey Lira", price: 31.452, change: +1.25, type: MarketType.FOREX },
  { symbol: "EUR/TRY", name: "Euro / Turkey Lira", price: 34.054, change: +1.10, type: MarketType.FOREX },
  { symbol: "USD/SGD", name: "US Dollar / Singapore Dollar", price: 1.3452, change: -0.05, type: MarketType.FOREX },
  { symbol: "USD/HKD", name: "US Dollar / HK Dollar", price: 7.8213, change: +0.01, type: MarketType.FOREX },
  { symbol: "USD/NOK", name: "US Dollar / Norway Krone", price: 10.542, change: +0.42, type: MarketType.FOREX },
  { symbol: "USD/SEK", name: "US Dollar / Sweden Krona", price: 10.354, change: +0.35, type: MarketType.FOREX },
  { symbol: "USD/DKK", name: "US Dollar / Denmark Krone", price: 6.8542, change: +0.02, type: MarketType.FOREX },
  { symbol: "XAU/USD", name: "Gold / US Dollar", price: 2034.45, change: +0.85, type: MarketType.FOREX },
  { symbol: "XAG/USD", name: "Silver / US Dollar", price: 22.84, change: +1.15, type: MarketType.FOREX },
  { symbol: "WTI/USD", name: "Crude Oil (WTI)", price: 78.45, change: -0.55, type: MarketType.FOREX },
];

export const INITIAL_CRYPTO_DATA: MarketData[] = [
  { symbol: "BTC/USDT", name: "Bitcoin", price: 62450.20, change: +2.45, type: MarketType.CRYPTO },
  { symbol: "ETH/USDT", name: "Ethereum", price: 3450.15, change: +1.80, type: MarketType.CRYPTO },
  { symbol: "SOL/USDT", name: "Solana", price: 134.20, change: +5.20, type: MarketType.CRYPTO },
  { symbol: "BNB/USDT", name: "Binance Coin", price: 412.50, change: -0.50, type: MarketType.CRYPTO },
  { symbol: "XRP/USDT", name: "Ripple", price: 0.5842, change: +1.12, type: MarketType.CRYPTO },
  { symbol: "ADA/USDT", name: "Cardano", price: 0.584, change: -1.25, type: MarketType.CRYPTO },
  { symbol: "AVAX/USDT", name: "Avalanche", price: 38.45, change: +2.34, type: MarketType.CRYPTO },
  { symbol: "DOGE/USDT", name: "Dogecoin", price: 0.1245, change: +8.42, type: MarketType.CRYPTO },
  { symbol: "DOT/USDT", name: "Polkadot", price: 8.42, change: +0.55, type: MarketType.CRYPTO },
  { symbol: "LINK/USDT", name: "Chainlink", price: 19.45, change: +3.12, type: MarketType.CRYPTO },
  { symbol: "MATIC/USDT", name: "Polygon", price: 1.02, change: -0.45, type: MarketType.CRYPTO },
  { symbol: "SHIB/USDT", name: "Shiba Inu", price: 0.00001245, change: +12.45, type: MarketType.CRYPTO },
  { symbol: "DAI/USDT", name: "Dai Stablecoin", price: 1.00, change: 0.00, type: MarketType.CRYPTO },
  { symbol: "LTC/USDT", name: "Litecoin", price: 74.21, change: +1.22, type: MarketType.CRYPTO },
  { symbol: "BCH/USDT", name: "Bitcoin Cash", price: 302.45, change: +5.12, type: MarketType.CRYPTO },
  { symbol: "TRX/USDT", name: "Tron", price: 0.1425, change: +0.22, type: MarketType.CRYPTO },
  { symbol: "ATOM/USDT", name: "Cosmos", price: 10.45, change: -1.15, type: MarketType.CRYPTO },
  { symbol: "UNI/USDT", name: "Uniswap", price: 11.23, change: +15.42, type: MarketType.CRYPTO },
  { symbol: "ETC/USDT", name: "Ethereum Classic", price: 28.45, change: +2.12, type: MarketType.CRYPTO },
  { symbol: "XMR/USDT", name: "Monero", price: 142.15, change: -0.55, type: MarketType.CRYPTO },
  { symbol: "XLM/USDT", name: "Stellar", price: 0.1242, change: +1.10, type: MarketType.CRYPTO },
  { symbol: "FIL/USDT", name: "Filecoin", price: 8.12, change: +4.22, type: MarketType.CRYPTO },
  { symbol: "HBAR/USDT", name: "Hedera", price: 0.1123, change: +3.12, type: MarketType.CRYPTO },
  { symbol: "NEAR/USDT", name: "Near Protocol", price: 4.25, change: +6.45, type: MarketType.CRYPTO },
  { symbol: "LDO/USDT", name: "Lido DAO", price: 2.15, change: -2.12, type: MarketType.CRYPTO },
  { symbol: "APT/USDT", name: "Aptos", price: 12.45, change: +1.45, type: MarketType.CRYPTO },
  { symbol: "OP/USDT", name: "Optimism", price: 3.84, change: +2.12, type: MarketType.CRYPTO },
  { symbol: "ARB/USDT", name: "Arbitrum", price: 1.92, change: +0.55, type: MarketType.CRYPTO },
  { symbol: "MNT/USDT", name: "Mantle", price: 0.85, change: +4.12, type: MarketType.CRYPTO },
  { symbol: "RNDR/USDT", name: "Render", price: 7.42, change: +10.45, type: MarketType.CRYPTO },
  { symbol: "STX/USDT", name: "Stacks", price: 2.84, change: +5.12, type: MarketType.CRYPTO },
  { symbol: "INJ/USDT", name: "Injective", price: 34.21, change: -1.22, type: MarketType.CRYPTO },
  { symbol: "TIA/USDT", name: "Celestia", price: 16.45, change: -2.45, type: MarketType.CRYPTO },
  { symbol: "KAS/USDT", name: "Kaspa", price: 0.165, change: +1.22, type: MarketType.CRYPTO },
  { symbol: "SEI/USDT", name: "Sei Network", price: 0.82, change: +0.45, type: MarketType.CRYPTO },
  { symbol: "SUI/USDT", name: "Sui", price: 1.62, change: +3.42, type: MarketType.CRYPTO },
  { symbol: "PEPE/USDT", name: "Pepe Coin", price: 0.00000284, change: +15.22, type: MarketType.CRYPTO },
  { symbol: "WIF/USDT", name: "Dogwifhat", price: 0.84, change: +22.12, type: MarketType.CRYPTO },
  { symbol: "BONK/USDT", name: "Bonk", price: 0.00001245, change: +5.45, type: MarketType.CRYPTO },
  { symbol: "FET/USDT", name: "Fetch.ai", price: 1.45, change: +12.12, type: MarketType.CRYPTO },
  { symbol: "AGIX/USDT", name: "SingularityNET", price: 0.82, change: +10.45, type: MarketType.CRYPTO },
  { symbol: "OCEAN/USDT", name: "Ocean Protocol", price: 0.92, change: +8.42, type: MarketType.CRYPTO },
  { symbol: "GALA/USDT", name: "Gala Games", price: 0.042, change: +4.12, type: MarketType.CRYPTO },
  { symbol: "BEAM/USDT", name: "Beam", price: 0.034, change: +2.12, type: MarketType.CRYPTO },
  { symbol: "IMX/USDT", name: "Immutable X", price: 3.12, change: +1.22, type: MarketType.CRYPTO },
  { symbol: "STETH/USDT", name: "Lido Staked ETH", price: 3448.12, change: +1.80, type: MarketType.CRYPTO },
  { symbol: "WBTC/USDT", name: "Wrapped Bitcoin", price: 62445.12, change: +2.45, type: MarketType.CRYPTO },
  { symbol: "ICP/USDT", name: "Internet Computer", price: 12.45, change: +1.12, type: MarketType.CRYPTO },
  { symbol: "RUNE/USDT", name: "Thorchain", price: 5.42, change: +6.45, type: MarketType.CRYPTO },
  { symbol: "AAVE/USDT", name: "Aave", price: 102.45, change: +2.12, type: MarketType.CRYPTO },
];

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 20L80 20L50 80L20 20Z" fill="url(#grad1)" />
    <path d="M50 20L80 80L20 80L50 20Z" fill="white" fillOpacity="0.2" />
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#2962ff', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#f3ba2f', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
  </svg>
);
