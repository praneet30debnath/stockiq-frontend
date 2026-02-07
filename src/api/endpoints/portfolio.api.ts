import { axiosInstance } from '../axios-config';
import { Portfolio, Transaction, TransactionRequest, PortfolioAnalytics, TimeBasedPortfolio, TransactionPLSummary } from '@/types';

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: 'ALL' | 'BUY' | 'SELL';
  symbols?: string[];
}

export const portfolioApi = {
  getPortfolio: () => axiosInstance.get<Portfolio>(`/portfolio`),

  getTimeBasedGains: () => axiosInstance.get<TimeBasedPortfolio>(`/portfolio/time-based-gains`),

  addTransaction: (data: TransactionRequest) =>
    axiosInstance.post<Transaction>(`/portfolio/transactions`, data),

  getTransactions: (filters?: TransactionFilters) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.type && filters.type !== 'ALL') params.append('type', filters.type);
    if (filters?.symbols && filters.symbols.length > 0) {
      filters.symbols.forEach(symbol => params.append('symbols', symbol));
    }

    const queryString = params.toString();
    return axiosInstance.get<Transaction[]>(`/portfolio/transactions${queryString ? `?${queryString}` : ''}`);
  },

  getTransactionSymbols: () => axiosInstance.get<string[]>(`/portfolio/transactions/symbols`),

  getTransactionPLSummary: (filters?: TransactionFilters) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.type && filters.type !== 'ALL') params.append('type', filters.type);
    if (filters?.symbols && filters.symbols.length > 0) {
      filters.symbols.forEach(symbol => params.append('symbols', symbol));
    }

    const queryString = params.toString();
    return axiosInstance.get<TransactionPLSummary>(`/portfolio/transactions/summary${queryString ? `?${queryString}` : ''}`);
  },

  getTransactionsBySymbol: (symbol: string) =>
    axiosInstance.get<Transaction[]>(`/portfolio/transactions/${symbol}`),

  getAnalytics: () => axiosInstance.get<PortfolioAnalytics>(`/portfolio/analytics`),

  deleteHolding: (holdingId: number) => axiosInstance.delete(`/portfolio/holdings/${holdingId}`),
};
