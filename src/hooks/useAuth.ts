import { useAppDispatch, useAppSelector } from '@/store';
import { setCredentials, logout, setLoading, setError } from '@/store/slices/authSlice';
import { authApi } from '@/api/endpoints/auth.api';
import { LoginRequest, RegisterRequest } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch(setLoading(true));
      const response = await authApi.login(credentials);
      dispatch(setCredentials(response.data));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid username or password';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      dispatch(setLoading(true));
      const response = await authApi.register(data);
      dispatch(setCredentials(response.data));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: logoutUser,
  };
};
