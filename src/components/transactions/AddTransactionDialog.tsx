import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  InputAdornment,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioApi } from '@/api/endpoints/portfolio.api';
import { stocksApi } from '@/api/endpoints/stocks.api';
import { TransactionRequest } from '@/types';
import { isMarketOpen } from '@/utils/marketHolidays';

interface AddTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  symbol: string;
  transactionType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  transactionDate: string;
  brokerage?: number;
  stt?: number;
  otherCharges?: number;
  notes?: string;
}

export const AddTransactionDialog: React.FC<AddTransactionDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [stockOptions, setStockOptions] = useState<any[]>([]);
  const [stockSearchLoading, setStockSearchLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      transactionType: 'BUY',
      transactionDate: new Date().toISOString().split('T')[0],
      brokerage: 0,
      stt: 0,
      otherCharges: 0,
    },
  });

  const quantity = watch('quantity');
  const price = watch('price');
  const totalAmount = quantity && price ? quantity * price : 0;

  const handleStockSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setStockOptions([]);
      return;
    }

    try {
      setStockSearchLoading(true);
      const response = await stocksApi.searchStocks(searchQuery);
      setStockOptions(response.data || []);
    } catch (err) {
      console.error('Error searching stocks:', err);
      setStockOptions([]);
    } finally {
      setStockSearchLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const transactionData: TransactionRequest = {
        symbol: data.symbol,
        transactionType: data.transactionType,
        quantity: data.quantity,
        price: data.price,
        transactionDate: data.transactionDate,
        brokerage: data.brokerage || 0,
        stt: data.stt || 0,
        otherCharges: data.otherCharges || 0,
        notes: data.notes,
      };

      await portfolioApi.addTransaction(transactionData);

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      console.error('Error adding transaction:', err);
      setError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    setSuccess(false);
    setStockOptions([]);
    onClose();
  };

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
        <Typography variant="h5" fontWeight="bold" className="gradient-text">
          Add Transaction
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Record a new stock transaction
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
                  <Alert severity="success">Transaction added successfully!</Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Stock Symbol with Autocomplete */}
            <Controller
              name="symbol"
              control={control}
              rules={{ required: 'Stock symbol is required' }}
              render={({ field }) => (
                <Autocomplete
                  freeSolo
                  options={stockOptions}
                  getOptionLabel={(option) =>
                    typeof option === 'string' ? option : `${option.symbol} - ${option.companyName}`
                  }
                  loading={stockSearchLoading}
                  onInputChange={(_, newValue) => {
                    field.onChange(newValue.split(' - ')[0]);
                    handleStockSearch(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Stock Symbol"
                      placeholder="Search stock (e.g., RELIANCE, TCS)"
                      required
                      error={!!errors.symbol}
                      helperText={errors.symbol?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {stockSearchLoading ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />

            {/* Transaction Type */}
            <Controller
              name="transactionType"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Transaction Type</InputLabel>
                  <Select {...field} label="Transaction Type">
                    <MenuItem value="BUY">Buy</MenuItem>
                    <MenuItem value="SELL">Sell</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {/* Quantity and Price */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="quantity"
                control={control}
                rules={{
                  required: 'Quantity is required',
                  min: { value: 1, message: 'Minimum quantity is 1' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Quantity"
                    type="number"
                    required
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                    inputProps={{ min: 1, step: 1 }}
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
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
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

            {/* Optional Charges */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
              Additional Charges (Optional)
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <Controller
                name="brokerage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Brokerage"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                )}
              />

              <Controller
                name="stt"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="STT"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                )}
              />

              <Controller
                name="otherCharges"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Other"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                )}
              />
            </Box>

            {/* Notes */}
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notes"
                  multiline
                  rows={2}
                  placeholder="Add any additional notes about this transaction"
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
            disabled={loading || success}
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Transaction'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
