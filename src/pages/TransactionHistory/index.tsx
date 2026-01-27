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
} from '@mui/material';
import { Refresh, Clear } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { portfolioApi, TransactionFilters } from '@/api/endpoints/portfolio.api';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

type TransactionTypeFilter = 'ALL' | 'BUY' | 'SELL';
type SortField = 'transactionDate' | 'symbol' | 'transactionType' | 'quantity' | 'price' | 'totalAmount' | 'exchange';
type SortOrder = 'asc' | 'desc';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('transactionDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, typeFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: TransactionFilters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (typeFilter !== 'ALL') filters.type = typeFilter;

      const response = await portfolioApi.getTransactions(filters);
      setTransactions(response.data);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
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

  const hasActiveFilters = startDate || endDate || typeFilter !== 'ALL';

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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedTransactions.map((transaction) => (
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
                              backgroundColor:
                                transaction.transactionType === 'BUY'
                                  ? 'rgba(16, 185, 129, 0.1)'
                                  : 'rgba(239, 68, 68, 0.1)',
                              color:
                                transaction.transactionType === 'BUY'
                                  ? '#10b981'
                                  : '#ef4444',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{transaction.quantity}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(transaction.price)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(transaction.totalAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.exchange || 'NSE'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
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
    </Box>
  );
};

export default TransactionHistory;
