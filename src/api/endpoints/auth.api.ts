import { axiosInstance } from '../axios-config';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types';

export const authApi = {
  login: (data: LoginRequest) => axiosInstance.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) => axiosInstance.post<AuthResponse>('/auth/register', data),

  logout: () => axiosInstance.post('/auth/logout'),

  me: () => axiosInstance.get('/auth/me'),

  sendOtp: (email: string) => axiosInstance.post('/auth/send-otp', { email }),

  verifyOtp: (email: string, otp: string) => axiosInstance.post('/auth/verify-otp', { email, otp }),
};
