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

export interface MarketIndex {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

export type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '3y' | '5y' | 'max';
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
  exchange?: Exchange;
  cagrPercent?: number;
  xirrPercent?: number;
}

export interface Portfolio {
  totalInvested: number;
  currentValue: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
  portfolioXirr?: number;
  holdings: Holding[];
}

export type Exchange = 'NSE' | 'BSE';

export interface Transaction {
  id: number;
  symbol: string;
  companyName: string;
  transactionType: 'BUY' | 'SELL' | 'SPLIT' | 'BONUS';
  quantity: number;
  price: number;
  totalAmount: number;
  transactionDate: string;
  brokerage: number;
  stt: number;
  otherCharges: number;
  notes?: string;
  exchange: Exchange;
  // Corporate action fields
  splitRatio?: number;
  quantityBefore?: number;
  avgPriceBefore?: number;
}

export interface TransactionRequest {
  symbol: string;
  transactionType: 'BUY' | 'SELL' | 'SPLIT' | 'BONUS';
  quantity: number;
  price: number;
  transactionDate: string;
  brokerage?: number;
  stt?: number;
  otherCharges?: number;
  notes?: string;
  exchange?: Exchange;
  // Corporate action fields
  splitRatio?: number;
  oldFaceValue?: number;
  newFaceValue?: number;
}

export interface PortfolioAnalytics {
  sectorAllocation: Record<string, number>;
  topGainers: Holding[];
  topLosers: Holding[];
  dividendIncome: number;
}

export interface TransactionPLSummary {
  realizedPL: number;
  unrealizedPL: number;
  totalBuyAmount: number;
  totalSellAmount: number;
  buyCount: number;
  sellCount: number;
  holdingsCount: number;
  currentHoldingsValue: number;
  totalInvested: number;
}

// Time-Based Gains Types
export interface PeriodGain {
  gainPercent: number;
  gainAmount: number;
  applicable: boolean;
}

export interface TimeBasedHolding {
  id: number;
  symbol: string;
  companyName: string;
  invested: number;
  currentValue: number;
  oneDay: PeriodGain | null;
  fiveDays: PeriodGain | null;
  oneMonth: PeriodGain | null;
  threeMonths: PeriodGain | null;
  sixMonths: PeriodGain | null;
  oneYear: PeriodGain | null;
  threeYears: PeriodGain | null;
  fiveYears: PeriodGain | null;
  allTime: PeriodGain | null;
}

export interface TimeBasedPortfolio {
  holdings: TimeBasedHolding[];
  totalInvested: number;
  totalCurrentValue: number;
}

export type PortfolioViewMode = 'default' | 'time-based-gains';

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
export interface ScreenerStock {
  id: number;
  symbol: string;
  companyName: string;
  marketType: 'MAINBOARD' | 'SME' | null;
  exchangeSuffix: string | null;

  // NSE Data
  marketCap: number | null;
  issuedShares: number | null;
  faceValue: number | null;
  industry: string | null;

  // Yahoo Finance Data
  ltp: number | null;
  volume: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;

  // Time Gains (percentage)
  gain1D: number | null;
  gain5D: number | null;
  gain1M: number | null;
  gain3M: number | null;
  gain6M: number | null;
  gain1Y: number | null;
  gain5Y: number | null;

  // Timestamps
  nseDataUpdatedAt: string | null;
  yahooDataUpdatedAt: string | null;
}

export interface ScreenerFilter {
  search?: string;
  marketType?: 'MAINBOARD' | 'SME';
  industries?: string[];

  // Price range
  minPrice?: number;
  maxPrice?: number;

  // Market cap range
  minMarketCap?: number;
  maxMarketCap?: number;

  // Volume range
  minVolume?: number;
  maxVolume?: number;

  // Gain ranges
  minGain1D?: number;
  maxGain1D?: number;
  minGain5D?: number;
  maxGain5D?: number;
  minGain1M?: number;
  maxGain1M?: number;
  minGain3M?: number;
  maxGain3M?: number;
  minGain6M?: number;
  maxGain6M?: number;
  minGain1Y?: number;
  maxGain1Y?: number;
  minGain5Y?: number;
  maxGain5Y?: number;

  // 52-week filters
  near52WeekHigh?: boolean;
  near52WeekLow?: boolean;

  // Bullish trend filter
  bullishOnly?: boolean;
  requirePositiveGain1d?: boolean;

  // Sorting
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';

  // Pagination
  page?: number;
  size?: number;
}

export interface ScreenerStats {
  totalStocks: number;
  mainboardCount: number;
  smeCount: number;
  stocksWithYahooData: number;
  stocksWithNSEData: number;
  industriesCount: number;
  lastNSEUpdate: string | null;
  lastYahooUpdate: string | null;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

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
