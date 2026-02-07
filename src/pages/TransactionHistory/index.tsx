import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Autocomplete,
  Skeleton,
} from '@mui/material';
import { Refresh, Clear, TrendingUp, TrendingDown, AccountBalance } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { portfolioApi, TransactionFilters } from '@/api/endpoints/portfolio.api';
import { Transaction, TransactionPLSummary } from '@/types';
import { formatCurrency, formatDate, getChangeColor } from '@/utils/formatters';

type TransactionTypeFilter = 'ALL' | 'BUY' | 'SELL' | 'SPLIT' | 'BONUS';
type SortField = 'transactionDate' | 'symbol' | 'transactionType' | 'quantity' | 'price' | 'totalAmount' | 'exchange';
type SortOrder = 'asc' | 'desc';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // P&L Summary
  const [plSummary, setPLSummary] = useState<TransactionPLSummary | null>(null);
  const [plSummaryLoading, setPLSummaryLoading] = useState(true);

  // Available symbols for dropdown
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
  const [symbolsLoading, setSymbolsLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('ALL');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('transactionDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Fetch available symbols on mount
  useEffect(() => {
    fetchAvailableSymbols();
  }, []);

  // Fetch transactions and P&L summary when filters change
  useEffect(() => {
    fetchTransactions();
    fetchPLSummary();
  }, [startDate, endDate, typeFilter, selectedSymbols]);

  const fetchAvailableSymbols = async () => {
    try {
      setSymbolsLoading(true);
      const response = await portfolioApi.getTransactionSymbols();
      setAvailableSymbols(response.data);
    } catch (err) {
      console.error('Error fetching symbols:', err);
    } finally {
      setSymbolsLoading(false);
    }
  };

  const getFilters = (): TransactionFilters => {
    const filters: TransactionFilters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (typeFilter !== 'ALL') filters.type = typeFilter;
    if (selectedSymbols.length > 0) filters.symbols = selectedSymbols;
    return filters;
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await portfolioApi.getTransactions(getFilters());
      setTransactions(response.data);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPLSummary = async () => {
    try {
      setPLSummaryLoading(true);
      const response = await portfolioApi.getTransactionPLSummary(getFilters());
      setPLSummary(response.data);
    } catch (err) {
      console.error('Error fetching P&L summary:', err);
    } finally {
      setPLSummaryLoading(false);
    }
  };

  const handleTypeFilterChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: TransactionTypeFilter | null
  ) => {
    if (newType !== null) {
      setTypeFilter(newType);
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setTypeFilter('ALL');
    setSelectedSymbols([]);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions];
    return sorted.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'transactionDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'symbol' || sortField === 'transactionType' || sortField === 'exchange') {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [transactions, sortField, sortOrder]);

  const hasActiveFilters = startDate || endDate || typeFilter !== 'ALL' || selectedSymbols.length > 0;

  return (
    <Box>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
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
              Transaction History
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and filter all your stock transactions
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchTransactions}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Box>
      </motion.div>

      {/* Filters Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <TextField
                label="From Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ minWidth: 160 }}
              />
              <TextField
                label="To Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ minWidth: 160 }}
              />
              <Autocomplete
                multiple
                options={availableSymbols}
                value={selectedSymbols}
                onChange={(_, newValue) => setSelectedSymbols(newValue)}
                loading={symbolsLoading}
                size="small"
                limitTags={2}
                disableCloseOnSelect
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Stocks"
                    placeholder={selectedSymbols.length === 0 ? "All stocks" : ""}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={option}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  ))
                }
                sx={{ minWidth: 220 }}
              />
              <ToggleButtonGroup
                value={typeFilter}
                exclusive
                onChange={handleTypeFilterChange}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 2,
                    py: 0.75,
                    textTransform: 'none',
                    fontWeight: 600,
                  },
                }}
              >
                <ToggleButton value="ALL">All</ToggleButton>
                <ToggleButton value="BUY">Buy</ToggleButton>
                <ToggleButton value="SELL">Sell</ToggleButton>
                <ToggleButton value="SPLIT">Split</ToggleButton>
                <ToggleButton value="BONUS">Bonus</ToggleButton>
              </ToggleButtonGroup>
              {hasActiveFilters && (
                <Button
                  variant="text"
                  startIcon={<Clear />}
                  onClick={clearFilters}
                  size="small"
                  sx={{ ml: 'auto' }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* P&L Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Unrealized P&L Card */}
          <Card>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalance sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Unrealized P&L
                </Typography>
                {hasActiveFilters && (
                  <Chip label="Filtered" size="small" sx={{ ml: 'auto', fontSize: '0.65rem', height: 18 }} />
                )}
              </Box>
              {plSummaryLoading ? (
                <Skeleton width={120} height={32} />
              ) : (
                <>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: getChangeColor(plSummary?.unrealizedPL || 0) }}
                  >
                    {formatCurrency(plSummary?.unrealizedPL || 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {plSummary?.holdingsCount || 0} holdings • Invested: {formatCurrency(plSummary?.totalInvested || 0)}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* Realized P&L Card */}
          <Card>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {(plSummary?.realizedPL || 0) >= 0 ? (
                  <TrendingUp sx={{ fontSize: 20, color: 'text.secondary' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 20, color: 'text.secondary' }} />
                )}
                <Typography variant="body2" color="text.secondary">
                  Realized P&L
                </Typography>
                {hasActiveFilters && (
                  <Chip label="Filtered" size="small" sx={{ ml: 'auto', fontSize: '0.65rem', height: 18 }} />
                )}
              </Box>
              {plSummaryLoading ? (
                <Skeleton width={120} height={32} />
              ) : (
                <>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: getChangeColor(plSummary?.realizedPL || 0) }}
                  >
                    {formatCurrency(plSummary?.realizedPL || 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {plSummary?.sellCount || 0} sell transactions
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total P&L Card */}
          <Card sx={{ gridColumn: { xs: '1', sm: '1 / -1', md: 'auto' } }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Total P&L
                </Typography>
                {hasActiveFilters && (
                  <Chip label="Filtered" size="small" sx={{ ml: 'auto', fontSize: '0.65rem', height: 18 }} />
                )}
              </Box>
              {plSummaryLoading ? (
                <Skeleton width={120} height={32} />
              ) : (
                <>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      color: getChangeColor(
                        (plSummary?.realizedPL || 0) + (plSummary?.unrealizedPL || 0)
                      ),
                    }}
                  >
                    {formatCurrency((plSummary?.realizedPL || 0) + (plSummary?.unrealizedPL || 0))}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Buy: {formatCurrency(plSummary?.totalBuyAmount || 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sell: {formatCurrency(plSummary?.totalSellAmount || 0)}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Transactions ({transactions.length})
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : transactions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No transactions found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasActiveFilters
                    ? 'Try adjusting your filters to see more results'
                    : 'Add transactions from the Portfolio page to see them here'}
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'transactionDate'}
                          direction={sortField === 'transactionDate' ? sortOrder : 'asc'}
                          onClick={() => handleSort('transactionDate')}
                        >
                          Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'symbol'}
                          direction={sortField === 'symbol' ? sortOrder : 'asc'}
                          onClick={() => handleSort('symbol')}
                        >
                          Stock
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'transactionType'}
                          direction={sortField === 'transactionType' ? sortOrder : 'asc'}
                          onClick={() => handleSort('transactionType')}
                        >
                          Type
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={sortField === 'quantity'}
                          direction={sortField === 'quantity' ? sortOrder : 'asc'}
                          onClick={() => handleSort('quantity')}
                        >
                          Qty
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={sortField === 'price'}
                          direction={sortField === 'price' ? sortOrder : 'asc'}
                          onClick={() => handleSort('price')}
                        >
                          Price
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={sortField === 'totalAmount'}
                          direction={sortField === 'totalAmount' ? sortOrder : 'asc'}
                          onClick={() => handleSort('totalAmount')}
                        >
                          Total Amount
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'exchange'}
                          direction={sortField === 'exchange' ? sortOrder : 'asc'}
                          onClick={() => handleSort('exchange')}
                        >
                          Exchange
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedTransactions.map((transaction) => {
                      const isCorporateAction = transaction.transactionType === 'SPLIT' || transaction.transactionType === 'BONUS';

                      const getTypeColor = (type: string) => {
                        switch (type) {
                          case 'BUY': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
                          case 'SELL': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
                          case 'SPLIT': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
                          case 'BONUS': return { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' };
                          default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b' };
                        }
                      };

                      const typeColors = getTypeColor(transaction.transactionType);

                      return (
                        <TableRow
                          key={transaction.id}
                          hover
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(transaction.transactionDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {transaction.symbol}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {transaction.companyName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.transactionType}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                backgroundColor: typeColors.bg,
                                color: typeColors.color,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {isCorporateAction ? (
                              <Box>
                                <Typography variant="body2">
                                  {transaction.quantityBefore} → {transaction.quantity}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {transaction.splitRatio}x
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2">{transaction.quantity}</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {isCorporateAction ? (
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {transaction.avgPriceBefore ? formatCurrency(transaction.avgPriceBefore) : '-'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  avg before
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="body2">
                                {formatCurrency(transaction.price)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {isCorporateAction ? (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            ) : (
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(transaction.totalAmount)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.exchange || 'NSE'}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={transaction.notes || ''}
                            >
                              {transaction.notes || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default TransactionHistory;
