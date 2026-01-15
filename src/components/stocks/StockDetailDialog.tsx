import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { Close, TrendingUp, TrendingDown, ShoppingCart, Delete, Sell, Add } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercent, getChangeColor } from '@/utils/formatters';
import { StockChart } from './StockChart';
import { portfolioApi } from '@/api/endpoints/portfolio.api';
import { Transaction } from '@/types';

interface StockDetailDialogProps {
  open: boolean;
  onClose: () => void;
  onBuy?: () => void;
  onSell?: () => void;
  onDelete?: () => void;
  stock: {
    id?: number;
    symbol: string;
    companyName: string;
    quantity: number;
    avgBuyPrice: number;
    currentPrice: number;
    invested: number;
    currentValue: number;
    gain: number;
    gainPercent: number;
    dayChange?: number;              // Portfolio day change
    dayChangePercent?: number;       // Portfolio day change %
    marketDayChange?: number;        // Market day change
    marketDayChangePercent?: number; // Market day change %
  } | null;
}

export const StockDetailDialog: React.FC<StockDetailDialogProps> = ({
  open,
  onClose,
  onBuy,
  onSell,
  onDelete,
  stock,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    if (open && stock) {
      fetchTransactions();
    } else {
      // Clear transactions when dialog closes
      setTransactions([]);
    }
  }, [open, stock]);

  const fetchTransactions = async () => {
    if (!stock) return;

    try {
      setLoadingTransactions(true);
      const response = await portfolioApi.getTransactionsBySymbol(stock.symbol);
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  if (!stock) return null;

  // Use market day change from portfolio API (already includes correct market data)
  const currentPrice = stock.currentPrice;
  const dayChange = stock.marketDayChange ?? 0;
  const dayChangePercent = stock.marketDayChangePercent ?? 0;

  const isProfit = stock.gain >= 0;
  const isDayGain = dayChange >= 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header */}
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" className="gradient-text">
              {stock.symbol}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {stock.companyName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ mt: -1, mr: -1 }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 2 }}>
          {/* Current Price Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              sx={{
                background: `linear-gradient(135deg, ${isDayGain ? '#10b98115' : '#ef444415'} 0%, ${isDayGain ? '#10b98105' : '#ef444405'} 100%)`,
                border: `1px solid ${isDayGain ? '#10b98120' : '#ef444420'}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Market Price
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                  <Typography variant="h3" fontWeight="bold">
                    {formatCurrency(currentPrice)}
                  </Typography>
                  {dayChange !== undefined && (
                    <Chip
                      icon={isDayGain ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                      label={`${isDayGain ? '+' : ''}${formatCurrency(dayChange)} (${dayChangePercent ? formatPercent(dayChangePercent) : '-'})`}
                      size="small"
                      sx={{
                        background: `${getChangeColor(dayChange)}15`,
                        color: getChangeColor(dayChange),
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Live market price
                </Typography>
              </CardContent>
            </Card>
          </motion.div>

          <Divider />

          {/* Price Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <StockChart
              symbol={stock.symbol}
              dayChange={dayChange}
              dayChangePercent={dayChangePercent}
            />
          </motion.div>

          <Divider />

          {/* Holdings Summary */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Your Holdings
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(102, 126, 234, 0.05)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    Quantity
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                    {stock.quantity} shares
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(118, 75, 162, 0.05)',
                    border: '1px solid rgba(118, 75, 162, 0.1)',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    Avg. Buy Price
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                    {formatCurrency(stock.avgBuyPrice)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Investment Details */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Investment Summary
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Invested
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {formatCurrency(stock.invested)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Current Value
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {formatCurrency(stock.currentValue)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${isProfit ? '#10b98115' : '#ef444415'} 0%, ${isProfit ? '#10b98105' : '#ef444405'} 100%)`,
                    border: `1px solid ${isProfit ? '#10b98120' : '#ef444420'}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {isProfit ? (
                      <TrendingUp sx={{ color: '#10b981', fontSize: 24 }} />
                    ) : (
                      <TrendingDown sx={{ color: '#ef4444', fontSize: 24 }} />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Total {isProfit ? 'Gain' : 'Loss'}
                    </Typography>
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: isProfit ? '#10b981' : '#ef4444' }}
                  >
                    {isProfit ? '+' : ''}{formatCurrency(stock.gain)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: isProfit ? '#10b981' : '#ef4444', fontWeight: 600 }}
                  >
                    {isProfit ? '+' : ''}{formatPercent(stock.gainPercent)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Calculation Breakdown */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Calculation Breakdown
            </Typography>
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                background: 'rgba(0, 0, 0, 0.02)',
                fontFamily: 'monospace',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Invested:
                </Typography>
                <Typography variant="body2">
                  {stock.quantity} shares × {formatCurrency(stock.avgBuyPrice)} = {formatCurrency(stock.invested)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Value:
                </Typography>
                <Typography variant="body2">
                  {stock.quantity} shares × {formatCurrency(currentPrice)} = {formatCurrency(currentPrice * stock.quantity)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight="600">
                  {isProfit ? 'Profit' : 'Loss'}:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  sx={{ color: isProfit ? '#10b981' : '#ef4444' }}
                >
                  {formatCurrency(stock.currentValue)} - {formatCurrency(stock.invested)} = {isProfit ? '+' : ''}{formatCurrency(stock.gain)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Transaction History */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Transaction History
            </Typography>
            {loadingTransactions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : transactions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No transactions found for this stock
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.transactionDate).toLocaleDateString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={transaction.transactionType === 'BUY' ? <ShoppingCart sx={{ fontSize: 14 }} /> : undefined}
                            label={transaction.transactionType}
                            size="small"
                            sx={{
                              background: transaction.transactionType === 'BUY' ? '#10b98115' : '#ef444415',
                              color: transaction.transactionType === 'BUY' ? '#10b981' : '#ef4444',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{transaction.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(transaction.price)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(transaction.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {transaction.notes || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </DialogContent>

      {/* Action Buttons */}
      {(onBuy || onSell || onDelete) && (
        <DialogActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {onBuy && (
              <Button
                variant="contained"
                color="success"
                startIcon={<Add />}
                onClick={onBuy}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Buy More
              </Button>
            )}
            {onSell && (
              <Button
                variant="contained"
                color="error"
                startIcon={<Sell />}
                onClick={onSell}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Sell Stock
              </Button>
            )}
          </Box>
          <Box>
            {onDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={onDelete}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Delete Holding
              </Button>
            )}
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
};
