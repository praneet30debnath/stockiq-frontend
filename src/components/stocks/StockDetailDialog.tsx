import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { Close, TrendingUp, TrendingDown } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercent, getChangeColor } from '@/utils/formatters';

interface StockDetailDialogProps {
  open: boolean;
  onClose: () => void;
  stock: {
    symbol: string;
    companyName: string;
    quantity: number;
    avgBuyPrice: number;
    currentPrice: number;
    invested: number;
    currentValue: number;
    gain: number;
    gainPercent: number;
    dayChange?: number;
    dayChangePercent?: number;
  } | null;
}

export const StockDetailDialog: React.FC<StockDetailDialogProps> = ({
  open,
  onClose,
  stock,
}) => {
  if (!stock) return null;

  const isProfit = stock.gain >= 0;
  const isDayGain = (stock.dayChange || 0) >= 0;

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
                background: `linear-gradient(135deg, ${isProfit ? '#10b98115' : '#ef444415'} 0%, ${isProfit ? '#10b98105' : '#ef444405'} 100%)`,
                border: `1px solid ${isProfit ? '#10b98120' : '#ef444420'}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Market Price
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                  <Typography variant="h3" fontWeight="bold">
                    {formatCurrency(stock.currentPrice)}
                  </Typography>
                  {stock.dayChange !== undefined && (
                    <Chip
                      icon={isDayGain ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                      label={`${isDayGain ? '+' : ''}${formatCurrency(stock.dayChange)} (${stock.dayChangePercent ? formatPercent(stock.dayChangePercent) : '-'})`}
                      size="small"
                      sx={{
                        background: `${getChangeColor(stock.dayChange)}15`,
                        color: getChangeColor(stock.dayChange),
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
                  {stock.quantity} shares × {formatCurrency(stock.currentPrice)} = {formatCurrency(stock.currentValue)}
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
        </Box>
      </DialogContent>
    </Dialog>
  );
};
