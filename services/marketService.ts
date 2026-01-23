import { MarketData, MarketType } from '../types';

/**
 * ZENTUM MARKET SERVICE - النسخة الكاملة والمحدثة
 * مسؤول عن جلب الأسعار الحقيقية للحسابات والعمليات الممالية
 */

// بروكسي لتجاوز حظر إندونيسيا (Internet Positif)
const PROXY = "https://api.allorigins.win/get?url=";

// 1. جلب أسعار الكريبتو الحقيقية (Binance عبر CryptoCompare لتجنب الحظر)
export const fetchLivePrices = async () => {
  try {
    // قائمة العملات المطلوبة
    const symbols = "BTC,ETH,SOL,BNB,XRP,ADA,AVAX,DOT,LINK,MATIC,DOGE,TRX,LTC,BCH";
    const CRYPTO_URL = encodeURIComponent(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD&t=${Date.now()}`);
    
    const res = await fetch(`${PROXY}${CRYPTO_URL}`);
    if (!res.ok) throw new Error();
    
    const json = await res.json();
    // فك محتوى البروكسي
    return JSON.parse(json.contents); 
  } catch (e) {
    console.error("Crypto Sync Error");
    return null;
  }
};

// 2. جلب أسعار الفوركس (ExchangeRate API)
export const fetchFXPrices = async () => {
  try {
    const FX_URL = `https://api.exchangerate-api.com/v4/latest/USD?t=${Date.now()}`;
    const res = await fetch(FX_URL);
    if (!res.ok) throw new Error();
    
    const data = await res.json();
    return data.rates;
  } catch (e) {
    console.error("Forex Sync Error");
    return null;
  }
};

/**
 * دالة مساعدة لتنسيق البيانات للقائمة الجانبية (Sidebar)
 * تدمج البيانات الحقيقية مع الهيكل المطلوب في الموقع
 */
export const getFormattedMarkets = async (type: MarketType): Promise<MarketData[]> => {
  if (type === MarketType.CRYPTO) {
    const prices = await fetchLivePrices();
    if (!prices) return [];

    return Object.keys(prices).map(key => ({
      symbol: `${key}/USDT`,
      name: key === 'BTC' ? 'Bitcoin' : key,
      price: prices[key].USD,
      change: (Math.random() - 0.5) * 2, // محاكاة نسبة التغير
      type: MarketType.CRYPTO
    }));
  } else {
    const rates = await fetchFXPrices();
    if (!rates) return [];

    // أزواج الفوركس المحددة
    const fxPairs = [
      { s: "EUR/USD", p: 1 / rates.EUR },
      { s: "GBP/USD", p: 1 / rates.GBP },
      { s: "USD/JPY", p: rates.JPY },
      { s: "AUD/USD", p: 1 / rates.AUD },
      { s: "USD/CAD", p: rates.CAD },
      { s: "XAU/USD", p: 2035.50 } // الذهب سعر تقريبي للتجربة
    ];

    return fxPairs.map(pair => ({
      symbol: pair.s,
      name: pair.s === "XAU/USD" ? "Gold vs USD" : "Currency Pair",
      price: pair.p,
      change: (Math.random() - 0.5) * 0.1,
      type: MarketType.FOREX
    }));
  }
};

/**
 * دالة لحساب الربح/الخسارة اللحظي للفوركس
 * تعتمد على سعر الدخول، السعر الحالي، وحجم العقد (Lot)
 */
export const calculateForexPL = (order: any, currentPrice: number) => {
  const diff = order.type === 'BUY' 
    ? (currentPrice - order.openPrice) 
    : (order.openPrice - currentPrice);
    
  // معامل الضرب (10000 للعملات العادية و 100 للذهب/الين)
  const multiplier = order.symbol.includes('JPY') || order.symbol.includes('XAU') ? 100 : 10000;
  return diff * order.volume * multiplier;
};