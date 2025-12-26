import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableSortLabel,
} from '@mui/material';
import { Add, TrendingUp, TrendingDown, Delete, Refresh, AccountBalance, Assessment } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercent, getChangeColor } from '@/utils/formatters';
import { portfolioApi } from '@/api/endpoints/portfolio.api';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { StockDetailDialog } from '@/components/stocks/StockDetailDialog';
import { Holding } from '@/types';

type SortField = 'symbol' | 'currentValue' | 'gain' | 'gainPercent' | 'dayChange';
type SortOrder = 'asc' | 'desc';

const StatCard = ({ title, value, subtitle, icon, color }: any) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}20`,
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ my: 1 }}>
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
            width: 44,
            height: 44,
            borderRadius: '10px',
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
);

const Portfolio = () => {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [holdingToDelete, setHoldingToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('currentValue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await portfolioApi.getPortfolio();
      setPortfolioData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
      setError(err.response?.data?.message || 'Failed to fetch portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (holding: any, event: React.MouseEvent) => {
    event.stopPropagation();
    setHoldingToDelete(holding);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!holdingToDelete) return;

    try {
      setDeleteLoading(true);
      await portfolioApi.deleteHolding(holdingToDelete.id);
      setDeleteConfirmOpen(false);
      setHoldingToDelete(null);
      fetchPortfolio();
    } catch (err: any) {
      console.error('Error deleting holding:', err);
      setError(err.response?.data?.message || 'Failed to delete holding');
      setDeleteConfirmOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedHoldings = () => {
    if (!portfolioData?.holdings) return [];

    const holdings = [...portfolioData.holdings];
    return holdings.sort((a: Holding, b: Holding) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'symbol') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
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
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchPortfolio} startIcon={<Refresh />}>
          Retry
        </Button>
      </Box>
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

  const holdings = sortedHoldings();

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Portfolio Holdings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your stock holdings and track performance
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchPortfolio}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddTransactionOpen(true)}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Add Transaction
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Invested"
            value={formatCurrency(stats.totalInvested)}
            icon={<AccountBalance sx={{ color: 'white' }} />}
            color="#667eea"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Current Value"
            value={formatCurrency(stats.currentValue)}
            icon={<Assessment sx={{ color: 'white' }} />}
            color="#764ba2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Gain"
            value={formatCurrency(stats.totalGain)}
            subtitle={formatPercent(stats.totalGainPercent)}
            icon={stats.totalGain >= 0 ? <TrendingUp sx={{ color: 'white' }} /> : <TrendingDown sx={{ color: 'white' }} />}
            color={stats.totalGain >= 0 ? '#10b981' : '#ef4444'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Change"
            value={formatCurrency(stats.dayChange)}
            subtitle={stats.dayChangePercent ? formatPercent(stats.dayChangePercent) : '-'}
            icon={stats.dayChange >= 0 ? <TrendingUp sx={{ color: 'white' }} /> : <TrendingDown sx={{ color: 'white' }} />}
            color={stats.dayChange >= 0 ? '#10b981' : '#ef4444'}
          />
        </Grid>
      </Grid>

      {/* Holdings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                All Holdings ({holdings.length})
              </Typography>
            </Box>
            {holdings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No holdings yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add your first transaction to start building your portfolio
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setAddTransactionOpen(true)}
                >
                  Add Transaction
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'symbol'}
                          direction={sortField === 'symbol' ? sortOrder : 'asc'}
                          onClick={() => handleSort('symbol')}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            Stock
                          </Typography>
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          Qty
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          Avg Price
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          Current Price
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={sortField === 'currentValue'}
                          direction={sortField === 'currentValue' ? sortOrder : 'asc'}
                          onClick={() => handleSort('currentValue')}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            Current Value
                          </Typography>
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={sortField === 'gain'}
                          direction={sortField === 'gain' ? sortOrder : 'asc'}
                          onClick={() => handleSort('gain')}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            Total Gain
                          </Typography>
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={sortField === 'dayChange'}
                          direction={sortField === 'dayChange' ? sortOrder : 'asc'}
                          onClick={() => handleSort('dayChange')}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            Day Change
                          </Typography>
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={700}>
                          Actions
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {holdings.map((holding: Holding) => (
                      <TableRow
                        key={holding.id}
                        hover
                        onClick={() => setSelectedStock(holding)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'rgba(99, 102, 241, 0.02)',
                          },
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {holding.symbol}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {holding.companyName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{holding.quantity}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(holding.avgBuyPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(holding.currentPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(holding.currentValue)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Invested: {formatCurrency(holding.invested)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: getChangeColor(holding.gain) }}
                          >
                            {formatCurrency(holding.gain)}
                          </Typography>
                          <Chip
                            label={formatPercent(holding.gainPercent)}
                            size="small"
                            sx={{
                              mt: 0.5,
                              background: `${getChangeColor(holding.gainPercent)}15`,
                              color: getChangeColor(holding.gainPercent),
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: getChangeColor(holding.dayChange) }}
                          >
                            {formatCurrency(holding.dayChange)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: getChangeColor(holding.dayChangePercent) }}
                          >
                            {formatPercent(holding.dayChangePercent)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={(e) => handleDeleteClick(holding, e)}
                            size="small"
                            sx={{
                              color: '#ef4444',
                              '&:hover': {
                                background: 'rgba(239, 68, 68, 0.1)',
                              },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Delete Holding
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to delete <strong>{holdingToDelete?.symbol}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will remove all transactions and holdings for this stock. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            sx={{ minWidth: 100 }}
          >
            {deleteLoading ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Portfolio;
