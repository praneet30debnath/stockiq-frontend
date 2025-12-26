import { axiosInstance } from '../axios-config';
import { Portfolio, Transaction, TransactionRequest, PortfolioAnalytics } from '@/types';

export const portfolioApi = {
  getPortfolio: () => axiosInstance.get<Portfolio>(`/portfolio`),

  addTransaction: (data: TransactionRequest) =>
    axiosInstance.post<Transaction>(`/portfolio/transactions`, data),

  getTransactions: () => axiosInstance.get<Transaction[]>(`/portfolio/transactions`),

  getAnalytics: () => axiosInstance.get<PortfolioAnalytics>(`/portfolio/analytics`),

  deleteHolding: (holdingId: number) => axiosInstance.delete(`/portfolio/holdings/${holdingId}`),
};
