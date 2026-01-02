import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL, STORAGE_KEYS } from '@/utils/constants';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds - increased for portfolio with multiple stocks
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Handle 401 Unauthorized
    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      toast.error('Your session has expired. Please login again.', {
        duration: 4000,
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      return Promise.reject(error);
    }

    // Handle 403 Forbidden for expired/invalid tokens
    // Don't redirect if it's a change-password request (could be wrong current password)
    if (status === 403 && !requestUrl.includes('/auth/change-password')) {
      const hasAuthHeader = error.config?.headers?.Authorization;

      // If request had auth token and got 403, it's likely an expired/invalid token
      if (hasAuthHeader) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        toast.error('Your login session has expired. Please login again to continue.', {
          duration: 4000,
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
