import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance,
  Visibility,
  Notifications,
  Assessment,
  FilterList,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { ROUTES } from '@/routes/routes.config';

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: ROUTES.DASHBOARD },
  { label: 'Portfolio', icon: <AccountBalance />, path: ROUTES.PORTFOLIO },
  { label: 'Watchlist', icon: <Visibility />, path: ROUTES.WATCHLIST },
  { label: 'Alerts', icon: <Notifications />, path: ROUTES.ALERTS },
  { label: 'Tax Reports', icon: <Assessment />, path: ROUTES.TAX_REPORTS },
  { label: 'Screener', icon: <FilterList />, path: ROUTES.SCREENER },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const effectiveSidebarOpen = isLargeScreen && sidebarOpen;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: effectiveSidebarOpen ? 280 : { xs: 64, md: 72, lg: 80 },
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: effectiveSidebarOpen ? 280 : { xs: 64, md: 72, lg: 80 },
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.06)',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: { xs: 2, lg: 3 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          minHeight: 64,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: 36, lg: 40 },
            height: { xs: 36, lg: 40 },
            borderRadius: { xs: '10px', lg: '12px' },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            flexShrink: 0,
          }}
        >
          <TrendingUp sx={{ color: 'white', fontSize: { xs: 20, lg: 24 } }} />
        </Box>
        {effectiveSidebarOpen && (
          <Typography variant="h6" fontWeight="bold" className="gradient-text" noWrap>
            StockIQ
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ px: { xs: 1, md: 1.5, lg: 2 }, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          const listItem = (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                justifyContent: effectiveSidebarOpen ? 'flex-start' : 'center',
                minHeight: { xs: 44, lg: 48 },
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  color: '#667eea',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                  },
                },
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.05)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: effectiveSidebarOpen ? 40 : 'auto',
                  color: isActive ? '#667eea' : 'inherit',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {effectiveSidebarOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                  }}
                />
              )}
            </ListItemButton>
          );

          return effectiveSidebarOpen ? (
            listItem
          ) : (
            <Tooltip key={item.path} title={item.label} placement="right">
              {listItem}
            </Tooltip>
          );
        })}
      </List>

      {/* Footer */}
      {effectiveSidebarOpen && (
        <Box
          sx={{
            mt: 'auto',
            p: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            Version 1.0.0
          </Typography>
          <Typography variant="caption" color="text.secondary">
            © 2026 StockIQ
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};
