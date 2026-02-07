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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioApi } from '@/api/endpoints/portfolio.api';
import { stocksApi } from '@/api/endpoints/stocks.api';
import { TransactionRequest, Exchange } from '@/types';
import { isMarketOpen } from '@/utils/marketHolidays';

interface AddTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  symbol: string;
  transactionType: 'BUY' | 'SELL' | 'SPLIT' | 'BONUS';
  quantity: number;
  price: number;
  transactionDate: string;
  brokerage?: number;
  stt?: number;
  otherCharges?: number;
  notes?: string;
  exchange: Exchange;
  // Corporate action fields
  splitRatio?: number;
  oldFaceValue?: number;
  newFaceValue?: number;
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
  const [validatingStock, setValidatingStock] = useState(false);
  const [stockValidationError, setStockValidationError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      transactionType: 'BUY',
      transactionDate: new Date().toISOString().split('T')[0],
      brokerage: 0,
      stt: 0,
      otherCharges: 0,
      exchange: 'NSE',
    },
  });

  const quantity = watch('quantity');
  const price = watch('price');
  const symbol = watch('symbol');
  const exchange = watch('exchange');
  const transactionType = watch('transactionType');
  const oldFaceValue = watch('oldFaceValue');
  const newFaceValue = watch('newFaceValue');
  const totalAmount = quantity && price ? quantity * price : 0;

  const isCorporateAction = transactionType === 'SPLIT' || transactionType === 'BONUS';

  // Auto-calculate split ratio from face values
  const handleFaceValueChange = () => {
    if (oldFaceValue && newFaceValue && newFaceValue > 0) {
      const calculatedRatio = oldFaceValue / newFaceValue;
      setValue('splitRatio', calculatedRatio);
    }
  };

  const validateStockOnExchange = async (symbolToValidate: string, exchangeToValidate: Exchange) => {
    if (!symbolToValidate || symbolToValidate.length < 2) {
      setStockValidationError(null);
      return;
    }

    try {
      setValidatingStock(true);
      setStockValidationError(null);
      const response = await stocksApi.validateStockOnExchange(symbolToValidate, exchangeToValidate);
      if (!response.data.data) {
        setStockValidationError(`${symbolToValidate} is not available on ${exchangeToValidate}`);
      }
    } catch (err) {
      console.error('Error validating stock:', err);
      setStockValidationError(`Unable to validate stock on ${exchangeToValidate}`);
    } finally {
      setValidatingStock(false);
    }
  };

  const handleExchangeChange = (_event: React.MouseEvent<HTMLElement>, newExchange: Exchange | null) => {
    if (newExchange !== null) {
      setValue('exchange', newExchange);
      // Re-validate stock on the new exchange
      if (symbol && symbol.length >= 2) {
        validateStockOnExchange(symbol, newExchange);
      }
    }
  };

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

      // Ensure symbol is uppercase
      const symbolValue = data.symbol.toUpperCase();
      const isCorporate = data.transactionType === 'SPLIT' || data.transactionType === 'BONUS';

      // For corporate actions, we don't validate exchange (stock must already be in portfolio)
      if (!isCorporate) {
        // Validate stock on selected exchange before submitting
        const validationResponse = await stocksApi.validateStockOnExchange(symbolValue, data.exchange);
        if (!validationResponse.data.data) {
          setError(`${symbolValue} is not available on ${data.exchange}. Please check the symbol or select a different exchange.`);
          setLoading(false);
          return;
        }
      }

      // Validate split ratio for corporate actions
      if (isCorporate && (!data.splitRatio || data.splitRatio <= 0)) {
        setError('Split/Bonus ratio is required and must be greater than 0');
        setLoading(false);
        return;
      }

      const transactionData: TransactionRequest = {
        symbol: symbolValue,
        transactionType: data.transactionType,
        quantity: isCorporate ? 0 : data.quantity,
        price: isCorporate ? 0 : data.price,
        transactionDate: data.transactionDate,
        brokerage: isCorporate ? 0 : (data.brokerage || 0),
        stt: isCorporate ? 0 : (data.stt || 0),
        otherCharges: isCorporate ? 0 : (data.otherCharges || 0),
        notes: data.notes,
        exchange: data.exchange,
        splitRatio: isCorporate ? data.splitRatio : undefined,
        oldFaceValue: isCorporate ? data.oldFaceValue : undefined,
        newFaceValue: isCorporate ? data.newFaceValue : undefined,
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
    setStockValidationError(null);
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

            {/* Exchange Selector */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Exchange
              </Typography>
              <Controller
                name="exchange"
                control={control}
                render={({ field }) => (
                  <ToggleButtonGroup
                    value={field.value}
                    exclusive
                    onChange={handleExchangeChange}
                    fullWidth
                    sx={{
                      '& .MuiToggleButton-root': {
                        py: 1.5,
                        fontWeight: 600,
                        '&.Mui-selected': {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="NSE">
                      NSE (National Stock Exchange)
                    </ToggleButton>
                    <ToggleButton value="BSE">
                      BSE (Bombay Stock Exchange)
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              />
            </Box>

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
                  loading={stockSearchLoading || validatingStock}
                  onInputChange={(_, newValue) => {
                    const symbolValue = newValue.split(' - ')[0].toUpperCase();
                    field.onChange(symbolValue);
                    handleStockSearch(newValue);
                    // Validate on the selected exchange after a short delay
                    if (symbolValue && symbolValue.length >= 2) {
                      setTimeout(() => validateStockOnExchange(symbolValue, exchange), 500);
                    } else {
                      setStockValidationError(null);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Stock Symbol"
                      placeholder="Search stock (e.g., RELIANCE, TCS)"
                      required
                      error={!!errors.symbol || !!stockValidationError}
                      helperText={errors.symbol?.message || stockValidationError}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {(stockSearchLoading || validatingStock) ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      inputProps={{
                        ...params.inputProps,
                        style: { textTransform: 'uppercase' },
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
                    <MenuItem value="SPLIT">Stock Split</MenuItem>
                    <MenuItem value="BONUS">Bonus Issue</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            {/* Quantity and Price - only for BUY/SELL */}
            {!isCorporateAction && (
              <>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Controller
                    name="quantity"
                    control={control}
                    rules={{
                      required: !isCorporateAction ? 'Quantity is required' : false,
                      min: { value: 1, message: 'Minimum quantity is 1' },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Quantity"
                        type="number"
                        required={!isCorporateAction}
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
                      required: !isCorporateAction ? 'Price is required' : false,
                      min: { value: 0.01, message: 'Price must be greater than 0' },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Price per Share"
                        type="number"
                        required={!isCorporateAction}
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
              </>
            )}

            {/* Corporate Action Fields - only for SPLIT/BONUS */}
            {isCorporateAction && (
              <Box
                sx={{
                  p: 2,
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  {transactionType === 'SPLIT' ? 'Stock Split Details' : 'Bonus Issue Details'}
                </Typography>

                {transactionType === 'SPLIT' && (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Enter face value change (optional) or split ratio directly
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                      <Controller
                        name="oldFaceValue"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Old Face Value"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            inputProps={{ min: 0.01, step: 0.01 }}
                            onChange={(e) => {
                              field.onChange(e);
                              setTimeout(handleFaceValueChange, 100);
                            }}
                          />
                        )}
                      />
                      <Controller
                        name="newFaceValue"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="New Face Value"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            inputProps={{ min: 0.01, step: 0.01 }}
                            onChange={(e) => {
                              field.onChange(e);
                              setTimeout(handleFaceValueChange, 100);
                            }}
                          />
                        )}
                      />
                    </Box>
                  </>
                )}

                <Controller
                  name="splitRatio"
                  control={control}
                  rules={{
                    required: isCorporateAction ? 'Ratio is required' : false,
                    min: { value: 0.01, message: 'Ratio must be greater than 0' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={transactionType === 'SPLIT' ? 'Split Ratio (new shares per old share)' : 'Bonus Ratio (bonus shares per existing share)'}
                      type="number"
                      fullWidth
                      required
                      error={!!errors.splitRatio}
                      helperText={
                        errors.splitRatio?.message ||
                        (transactionType === 'SPLIT'
                          ? 'e.g., 10 for 10:1 split (1 share becomes 10 shares)'
                          : 'e.g., 0.5 for 1:2 bonus (1 bonus share for every 2 held), 1 for 1:1 bonus')
                      }
                      inputProps={{ min: 0.01, step: 0.01 }}
                    />
                  )}
                />

                <Alert severity="info" sx={{ mt: 2 }}>
                  {transactionType === 'SPLIT'
                    ? 'Stock split will multiply your quantity by the ratio and divide your average price by the same ratio. Total invested remains unchanged.'
                    : 'Bonus issue will add bonus shares to your holding. Average price will be adjusted proportionally. Total invested remains unchanged.'}
                </Alert>
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

            {/* Optional Charges - only for BUY/SELL */}
            {!isCorporateAction && (
              <>
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
              </>
            )}

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
                  label="Notes"
                  multiline
                  rows={2}
                  placeholder="Add any additional notes about this transaction"
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
