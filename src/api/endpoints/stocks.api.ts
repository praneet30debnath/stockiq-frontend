import { axiosInstance } from '../axios-config';
import { Stock, StockDetails, HistoricalData, TimeRange, TimeInterval } from '@/types';

export const stocksApi = {
  searchStocks: (query: string) =>
    axiosInstance.get<Stock[]>(`/stocks/search`, { params: { q: query } }),

  getStockDetails: (symbol: string) => axiosInstance.get<StockDetails>(`/stocks/${symbol}`),

  getHistoricalData: (symbol: string, range: TimeRange, interval: TimeInterval) =>
    axiosInstance.get<HistoricalData>(`/stocks/${symbol}/history`, {
      params: { range, interval },
    }),

  getNifty50: () => axiosInstance.get<Stock[]>(`/stocks/indices/nifty50`),

  getBankNifty: () => axiosInstance.get<Stock[]>(`/stocks/indices/banknifty`),
};
