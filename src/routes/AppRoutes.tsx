import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { ROUTES } from './routes.config';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Portfolio from '@/pages/Portfolio';
import Watchlist from '@/pages/Watchlist';
import Alerts from '@/pages/Alerts';
import TaxReports from '@/pages/TaxReports';
import Screener from '@/pages/Screener';
import Settings from '@/pages/Settings';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

        <Route element={<PrivateRoute />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.PORTFOLIO} element={<Portfolio />} />
          <Route path={ROUTES.WATCHLIST} element={<Watchlist />} />
          <Route path={ROUTES.ALERTS} element={<Alerts />} />
          <Route path={ROUTES.TAX_REPORTS} element={<TaxReports />} />
          <Route path={ROUTES.SCREENER} element={<Screener />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
};
