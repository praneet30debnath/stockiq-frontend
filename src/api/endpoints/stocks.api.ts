import { axiosInstance } from '../axios-config';
import { Stock, StockDetails, HistoricalData, MarketIndex, TimeRange, TimeInterval, Exchange } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const stocksApi = {
  searchStocks: (query: string) =>
    axiosInstance.get<Stock[]>(`/stocks/search`, { params: { q: query } }),

  getStockDetails: (symbol: string) => axiosInstance.get<StockDetails>(`/stocks/${symbol}`),

  getHistoricalData: (symbol: string, range: TimeRange, interval: TimeInterval, exchange: Exchange = 'NSE') =>
    axiosInstance.get<HistoricalData>(`/stocks/${symbol}/history`, {
      params: { range, interval, exchange },
    }),

  getMarketIndices: () => axiosInstance.get<MarketIndex[]>(`/stocks/indices`),

  validateStockOnExchange: (symbol: string, exchange: Exchange) =>
    axiosInstance.get<ApiResponse<boolean>>(`/stocks/${symbol}/validate`, {
      params: { exchange },
    }),

  getStockDetailsForExchange: (symbol: string, exchange: Exchange) =>
    axiosInstance.get<StockDetails>(`/stocks/${symbol}/details`, {
      params: { exchange },
    }),
};
