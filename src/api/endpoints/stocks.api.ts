import { axiosInstance } from '../axios-config';
import { Stock, StockDetails, HistoricalData, MarketIndex, TimeRange, TimeInterval } from '@/types';

export const stocksApi = {
  searchStocks: (query: string) =>
    axiosInstance.get<Stock[]>(`/stocks/search`, { params: { q: query } }),

  getStockDetails: (symbol: string) => axiosInstance.get<StockDetails>(`/stocks/${symbol}`),

  getHistoricalData: (symbol: string, range: TimeRange, interval: TimeInterval) =>
    axiosInstance.get<HistoricalData>(`/stocks/${symbol}/history`, {
      params: { range, interval },
    }),

  getMarketIndices: () => axiosInstance.get<MarketIndex[]>(`/stocks/indices`),
};
