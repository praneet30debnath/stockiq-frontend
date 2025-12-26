// Stock Types
export interface Stock {
  id: number;
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  marketCap: number;
  isin: string;
  exchange: 'NSE' | 'BSE';
  listingDate: string;
}

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export interface StockDetails extends Stock {
  currentPrice: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  weekHigh52: number;
  weekLow52: number;
  volume: number;
}

export interface OHLCVData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalData {
  symbol: string;
  data: OHLCVData[];
}

export type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y';
export type TimeInterval = '1m' | '5m' | '1h' | '1d' | '1wk' | '1mo';

// Portfolio Types
export interface Holding {
  id: number;
  symbol: string;
  companyName: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  gain: number;
  gainPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface Portfolio {
  totalInvested: number;
  currentValue: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: Holding[];
}

export interface Transaction {
  id: number;
  symbol: string;
  companyName: string;
  transactionType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalAmount: number;
  transactionDate: string;
  brokerage: number;
  stt: number;
  otherCharges: number;
  notes?: string;
}

export interface TransactionRequest {
  symbol: string;
  transactionType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  transactionDate: string;
  brokerage?: number;
  stt?: number;
  otherCharges?: number;
  notes?: string;
}

export interface PortfolioAnalytics {
  sectorAllocation: Record<string, number>;
  topGainers: Holding[];
  topLosers: Holding[];
  dividendIncome: number;
}

// User & Auth Types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Watchlist Types
export interface WatchlistItem {
  id: number;
  symbol: string;
  companyName: string;
  currentPrice: number;
  targetPrice?: number;
  change: number;
  changePercent: number;
  notes?: string;
  createdAt: string;
}

// Alert Types
export interface Alert {
  id: number;
  symbol: string;
  companyName: string;
  alertType: 'ABOVE' | 'BELOW';
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  triggeredAt?: string;
  createdAt: string;
}

// Tax Types
export interface CapitalGains {
  totalGain: number;
  taxableAmount: number;
  exemptAmount?: number;
  taxRate: number;
  taxAmount: number;
}

export interface CapitalGainsReport {
  financialYear: string;
  shortTermGains: CapitalGains;
  longTermGains: CapitalGains;
  transactions: Transaction[];
}

export interface TaxSummary {
  financialYear: string;
  totalSTCG: number;
  totalLTCG: number;
  totalTax: number;
  totalSTT: number;
  dividendIncome: number;
}

// Screener Types
export interface ScreenerCriteria {
  minPrice?: number;
  maxPrice?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  sectors?: string[];
  minChangePercent?: number;
  maxChangePercent?: number;
  sortBy?: 'price' | 'changePercent' | 'volume' | 'marketCap';
  sortOrder?: 'ASC' | 'DESC';
}
