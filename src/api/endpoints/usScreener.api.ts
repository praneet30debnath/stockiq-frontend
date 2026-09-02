import { axiosInstance } from '../axios-config';
import { UsScreenerStock, UsScreenerFilter, UsScreenerStats, PagedResponse } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const usScreenerApi = {
  /**
   * Get US screener data with pagination and sorting
   */
  getScreenerData: (
    page: number = 0,
    size: number = 50,
    sortBy: string = 'symbol',
    sortDirection: 'asc' | 'desc' = 'asc'
  ) =>
    axiosInstance.get<PagedResponse<UsScreenerStock>>('/screener/us', {
      params: { page, size, sortBy, sortDirection },
    }),

  /**
   * Filter US screener data with advanced criteria
   */
  filterScreenerData: (filter: UsScreenerFilter) =>
    axiosInstance.post<PagedResponse<UsScreenerStock>>('/screener/us/filter', filter),

  /**
   * Quick search by symbol or company name
   */
  searchScreenerData: (query: string, page: number = 0, size: number = 50) =>
    axiosInstance.get<PagedResponse<UsScreenerStock>>('/screener/us/search', {
      params: { q: query, page, size },
    }),

  /**
   * Get distinct sectors for filter dropdown
   */
  getSectors: () =>
    axiosInstance.get<ApiResponse<string[]>>('/screener/us/sectors'),

  /**
   * Get distinct industries for filter dropdown
   */
  getIndustries: () =>
    axiosInstance.get<ApiResponse<string[]>>('/screener/us/industries'),

  /**
   * Get US screener statistics
   */
  getStats: () =>
    axiosInstance.get<ApiResponse<UsScreenerStats>>('/screener/us/stats'),

  /**
   * Get single stock details by symbol
   */
  getStockDetails: (symbol: string) =>
    axiosInstance.get<ApiResponse<UsScreenerStock>>(`/screener/us/${symbol}`),

  /**
   * Trigger complete data update (admin)
   */
  triggerCompleteUpdate: () =>
    axiosInstance.post<ApiResponse<void>>('/screener/us/update'),

  /**
   * Trigger quick update - Yahoo data only (admin)
   */
  triggerQuickUpdate: () =>
    axiosInstance.post<ApiResponse<void>>('/screener/us/update/quick'),

  /**
   * Trigger symbol sync only (admin)
   */
  triggerSymbolSync: () =>
    axiosInstance.post<ApiResponse<void>>('/screener/us/update/symbols'),
};
