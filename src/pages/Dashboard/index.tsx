import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardContent, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance, Assessment, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercent, getChangeColor } from '@/utils/formatters';
import { portfolioApi } from '@/api/endpoints/portfolio.api';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { StockDetailDialog } from '@/components/stocks/StockDetailDialog';
import { getMarketStatus } from '@/utils/marketStatus';
import { ROUTES } from '@/routes/routes.config';

const StatCard = ({ title, value, subtitle, icon, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    transition={{ duration: 0.3 }}
  >
    <Card
      className="hover-lift"
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5, lg: 3 }, '&:last-child': { pb: { xs: 2, md: 2.5, lg: 3 } } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Auto-refresh portfolio every 15 seconds when market is open
  useEffect(() => {
    const interval = setInterval(() => {
      const marketStatus = getMarketStatus();

      if (marketStatus.isOpen) {
        // Market is open - refresh prices
        fetchPortfolio(true); // true = silent refresh (no loading spinner)
      }
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async (silentRefresh = false) => {
    try {
      if (!silentRefresh) {
        setLoading(true);
      }
      const response = await portfolioApi.getPortfolio();
      setPortfolioData(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
      if (!silentRefresh) {
        setError(err.response?.data?.message || 'Failed to fetch portfolio data');
      }
    } finally {
      if (!silentRefresh) {
        setLoading(false);
      }
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  const stats = {
    totalInvested: portfolioData?.totalInvested || 0,
    currentValue: portfolioData?.currentValue || 0,
    totalGain: portfolioData?.totalGain || 0,
    totalGainPercent: portfolioData?.totalGainPercent || 0,
    dayChange: portfolioData?.dayChange || 0,
    dayChangePercent: portfolioData?.dayChangePercent || 0,
  };

  const topHoldings = portfolioData?.holdings?.slice(0, 4) || [];

  return (
    <Box id="dashnpard-index-box">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box sx={{ mb: { xs: 2, md: 3, lg: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome back! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Here's your portfolio performance today
              </Typography>
            </Box>
            {lastUpdated && getMarketStatus().isOpen && (
              <Chip
                icon={<Refresh sx={{ fontSize: 16 }} />}
                label={`Updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
                size="small"
                sx={{
                  fontWeight: 600,
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, md: 2.5, lg: 3 }} sx={{ mb: { xs: 2, md: 3, lg: 4 } }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Invested"
            value={formatCurrency(stats.totalInvested)}
            icon={<AccountBalance sx={{ color: 'white' }} />}
            color="#667eea"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Current Value"
            value={formatCurrency(stats.currentValue)}
            icon={<Assessment sx={{ color: 'white' }} />}
            color="#764ba2"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Gain"
            value={formatCurrency(stats.totalGain)}
            subtitle={formatPercent(stats.totalGainPercent)}
            icon={stats.totalGain >= 0 ? <TrendingUp sx={{ color: 'white' }} /> : <TrendingDown sx={{ color: 'white' }} />}
            color={stats.totalGain >= 0 ? '#10b981' : '#ef4444'}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Today's Change"
            value={formatCurrency(stats.dayChange)}
            subtitle={stats.dayChangePercent ? formatPercent(stats.dayChangePercent) : '-'}
            icon={stats.dayChange >= 0 ? <TrendingUp sx={{ color: 'white' }} /> : <TrendingDown sx={{ color: 'white' }} />}
            color={stats.dayChange >= 0 ? '#10b981' : '#ef4444'}
          />
        </Grid>
      </Grid>

      {/* Top Holdings */}
      <Grid container spacing={{ xs: 2, md: 2.5, lg: 3 }}>
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent sx={{ p: { xs: 2, md: 2.5, lg: 3 } }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Top Holdings
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {topHoldings.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No holdings yet. Add your first transaction to get started!
                      </Typography>
                    </Box>
                  ) : (
                    topHoldings.map((holding: any, index: number) => (
                      <motion.div
                        key={holding.symbol}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Box
                          onClick={() => setSelectedStock(holding)}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            mb: 1,
                            background: 'rgba(99, 102, 241, 0.02)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              background: 'rgba(99, 102, 241, 0.05)',
                              transform: 'translateX(4px)',
                            },
                          }}
                        >
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {holding.symbol}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {holding.companyName}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body1" fontWeight="600">
                              {formatCurrency(holding.currentValue)}
                            </Typography>
                            <Chip
                              label={formatPercent(holding.gainPercent)}
                              size="small"
                              sx={{
                                background: `${getChangeColor(holding.gainPercent)}15`,
                                color: getChangeColor(holding.gainPercent),
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                        </Box>
                      </motion.div>
                    ))
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent sx={{ p: { xs: 2, md: 2.5, lg: 3 } }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { label: 'Add Transaction', color: '#667eea', onClick: () => setAddTransactionOpen(true) },
                    { label: 'View Portfolio', color: '#764ba2', onClick: () => navigate(ROUTES.PORTFOLIO) },
                    { label: 'View Tax Report', color: '#f59e0b', onClick: () => navigate(ROUTES.TAX_REPORTS) },
                    { label: 'Screen Stocks', color: '#10b981', onClick: () => navigate(ROUTES.SCREENER) },
                  ].map((action, index) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={action.onClick}
                      style={{
                        padding: '16px',
                        border: 'none',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}dd 100%)`,
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: `0 4px 12px ${action.color}40`,
                      }}
                    >
                      {action.label}
                    </motion.button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={addTransactionOpen}
        onClose={() => setAddTransactionOpen(false)}
        onSuccess={() => {
          fetchPortfolio();
        }}
      />

      {/* Stock Detail Dialog */}
      <StockDetailDialog
        open={!!selectedStock}
        onClose={() => setSelectedStock(null)}
        stock={selectedStock}
      />

    </Box>
  );
};

export default Dashboard;
