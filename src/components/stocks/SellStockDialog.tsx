import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown } from '@mui/icons-material';
import { portfolioApi } from '@/api/endpoints/portfolio.api';
import { TransactionRequest } from '@/types';
import { isMarketOpen } from '@/utils/marketHolidays';

interface SellStockDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  stock: {
    symbol: string;
    companyName: string;
    quantity: number;
    currentPrice: number;
  } | null;
}

interface FormData {
  quantity: number;
  price: number;
  transactionDate: string;
  notes?: string;
}

export const SellStockDialog: React.FC<SellStockDialogProps> = ({
  open,
  onClose,
  onSuccess,
  stock,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      quantity: 1,
      price: stock?.currentPrice || 0,
      transactionDate: new Date().toISOString().split('T')[0],
    },
  });

  const quantity = watch('quantity');
  const price = watch('price');
  const totalAmount = quantity && price ? quantity * price : 0;

  const onSubmit = async (data: FormData) => {
    if (!stock) return;

    try {
      setLoading(true);
      setError(null);

      const transactionData: TransactionRequest = {
        symbol: stock.symbol,
        transactionType: 'SELL',
        quantity: data.quantity,
        price: data.price,
        transactionDate: data.transactionDate,
        brokerage: 0,
        stt: 0,
        otherCharges: 0,
        notes: data.notes,
      };

      await portfolioApi.addTransaction(transactionData);

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      console.error('Error selling stock:', err);
      setError(err.response?.data?.message || 'Failed to sell stock');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset({
      quantity: 1,
      price: stock?.currentPrice || 0,
      transactionDate: new Date().toISOString().split('T')[0],
    });
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!stock) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingDown sx={{ color: '#ef4444' }} />
          <Typography variant="h5" fontWeight="bold">
            Sell Stock
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {stock.symbol} - {stock.companyName}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Alert severity="success">Stock sold successfully!</Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Available Quantity Info */}
            <Box
              sx={{
                p: 2,
                background: 'rgba(239, 68, 68, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(239, 68, 68, 0.1)',
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Available Quantity
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {stock.quantity}
                </Typography>
                <Chip
                  label="shares"
                  size="small"
                  sx={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>

            {/* Quantity and Price */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="quantity"
                control={control}
                rules={{
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Minimum quantity is 1' },
                  max: {
                    value: stock.quantity,
                    message: `Maximum quantity is ${stock.quantity}`,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Quantity to Sell"
                    type="number"
                    required
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                    inputProps={{ min: 1, max: stock.quantity, step: 1 }}
                  />
                )}
              />

              <Controller
                name="price"
                control={control}
                rules={{
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Price must be greater than 0' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Price per Share"
                    type="number"
                    required
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    inputProps={{ min: 0.01, step: 0.01 }}
                  />
                )}
              />
            </Box>

            {/* Total Amount Display */}
            {totalAmount > 0 && (
              <Box
                sx={{
                  p: 2,
                  background: 'rgba(16, 185, 129, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(16, 185, 129, 0.1)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total Sale Amount
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#10b981' }}>
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            )}

            {/* Transaction Date */}
            <Controller
              name="transactionDate"
              control={control}
              rules={{
                required: 'Transaction date is required',
                validate: (value) => {
                  const marketStatus = isMarketOpen(value);
                  if (!marketStatus.isOpen) {
                    return marketStatus.reason || 'Market is closed on this date';
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Transaction Date"
                  type="date"
                  required
                  error={!!errors.transactionDate}
                  helperText={errors.transactionDate?.message || 'Select a trading day (Mon-Fri, excluding holidays)'}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            {/* Notes */}
            <Controller
              name="notes"
              control={control}
              rules={{
                maxLength: { value: 500, message: 'Notes must not exceed 500 characters' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notes (Optional)"
                  multiline
                  rows={2}
                  placeholder="Add any additional notes about this sale"
                  inputProps={{ maxLength: 500 }}
                  helperText={
                    errors.notes?.message ||
                    `${field.value?.length || 0}/500 characters`
                  }
                  error={!!errors.notes}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={loading || success}
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sell Stock'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
