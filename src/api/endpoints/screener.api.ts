import { axiosInstance } from '../axios-config';
import { ScreenerStock, ScreenerFilter, ScreenerStats, PagedResponse } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const screenerApi = {
  /**
   * Get screener data with pagination and sorting
   */
  getScreenerData: (
    page: number = 0,
    size: number = 50,
    sortBy: string = 'symbol',
    sortDirection: 'asc' | 'desc' = 'asc'
  ) =>
    axiosInstance.get<PagedResponse<ScreenerStock>>('/screener', {
      params: { page, size, sortBy, sortDirection },
    }),

  /**
   * Filter screener data with advanced criteria
   */
  filterScreenerData: (filter: ScreenerFilter) =>
    axiosInstance.post<PagedResponse<ScreenerStock>>('/screener/filter', filter),

  /**
   * Quick search by symbol or company name
   */
  searchScreenerData: (query: string, page: number = 0, size: number = 50) =>
    axiosInstance.get<PagedResponse<ScreenerStock>>('/screener/search', {
      params: { q: query, page, size },
    }),

  /**
   * Get distinct industries for filter dropdown
   */
  getIndustries: () =>
    axiosInstance.get<ApiResponse<string[]>>('/screener/industries'),

  /**
   * Get screener statistics
   */
  getStats: () =>
    axiosInstance.get<ApiResponse<ScreenerStats>>('/screener/stats'),

  /**
   * Get single stock details by symbol
   */
  getStockDetails: (symbol: string) =>
    axiosInstance.get<ApiResponse<ScreenerStock>>(`/screener/${symbol}`),

  /**
   * Trigger complete data update (admin)
   */
  triggerCompleteUpdate: () =>
    axiosInstance.post<ApiResponse<void>>('/screener/update'),

  /**
   * Trigger quick update - Yahoo data only (admin)
   */
  triggerQuickUpdate: () =>
    axiosInstance.post<ApiResponse<void>>('/screener/update/quick'),

  /**
   * Trigger symbol sync only (admin)
   */
  triggerSymbolSync: () =>
    axiosInstance.post<ApiResponse<void>>('/screener/update/symbols'),
};
