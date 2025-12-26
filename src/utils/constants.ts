// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'StockIQ';

// Time ranges for stock charts
export const TIME_RANGES = [
  { label: '1D', value: '1d' as const },
  { label: '5D', value: '5d' as const },
  { label: '1M', value: '1mo' as const },
  { label: '3M', value: '3mo' as const },
  { label: '6M', value: '6mo' as const },
  { label: '1Y', value: '1y' as const },
  { label: '5Y', value: '5y' as const },
];

// Time intervals
export const TIME_INTERVALS = [
  { label: '1m', value: '1m' as const },
  { label: '5m', value: '5m' as const },
  { label: '1h', value: '1h' as const },
  { label: '1d', value: '1d' as const },
  { label: '1w', value: '1wk' as const },
  { label: '1M', value: '1mo' as const },
];

// Indian stock market sectors
export const SECTORS = [
  'Banking',
  'IT',
  'Pharma',
  'Auto',
  'Energy',
  'FMCG',
  'Metals',
  'Real Estate',
  'Telecom',
  'Cement',
  'Chemical',
  'Infrastructure',
  'Media',
  'Power',
  'Textiles',
];

// Market exchanges
export const EXCHANGES = ['NSE', 'BSE'] as const;

// Transaction types
export const TRANSACTION_TYPES = ['BUY', 'SELL'] as const;

// Alert types
export const ALERT_TYPES = ['ABOVE', 'BELOW'] as const;

// Tax rates (as per Indian tax laws)
export const TAX_RATES = {
  STCG: 15, // Short Term Capital Gains
  LTCG: 10, // Long Term Capital Gains
  LTCG_EXEMPTION: 100000, // ₹1 lakh exemption for LTCG
};

// Date formats
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Chart colors
export const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  gray: '#64748b',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebarOpen',
};
