import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ROUTES } from './routes.config';

export const PrivateRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};
