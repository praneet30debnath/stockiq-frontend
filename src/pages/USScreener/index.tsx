import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  CircularProgress,
  Button,
  Tooltip,
  Badge,
} from '@mui/material';
import { Search, FilterList, Refresh, TrendingUp, Business } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UsScreenerStock, UsScreenerFilter, UsScreenerStats } from '@/types';
import { usScreenerApi } from '@/api/endpoints/usScreener.api';
import { useDebounce } from '@/hooks/useDebounce';
import GainCell from '../Screener/components/GainCell';
import USScreenerFilters from './components/USScreenerFilters';

type SortField = 'symbol' | 'companyName' | 'marketCap' | 'ltp' | 'volume' |
  'gain1D' | 'gain5D' | 'gain1M' | 'gain3M' | 'gain6M' | 'gain1Y' | 'gain5Y' |
  'fiftyTwoWeekHigh' | 'fiftyTwoWeekLow' | 'sector' | 'industry';

const formatMarketCap = (value: number | null): string => {
  if (value === null || value === undefined) return '-';
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value.toLocaleString('en-US')}`;
};

const formatPrice = (value: number | null): string => {
  if (value === null || value === undefined) return '-';
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
};

const formatVolume = (value: number | null): string => {
  if (value === null || value === undefined) return '-';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString('en-US');
};

const USScreener = () => {
  const [stocks, setStocks] = useState<UsScreenerStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsScreenerStats | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [filter, setFilter] = useState<UsScreenerFilter>({
    page: 0,
    size: 50,
    sortBy: 'symbol',
    sortDirection: 'asc',
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch sectors on mount
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await usScreenerApi.getSectors();
        setSectors(response.data.data);
      } catch {
        console.error('Failed to fetch sectors');
      }
    };
    fetchSectors();
  }, []);

  // Fetch industries on mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await usScreenerApi.getIndustries();
        setIndustries(response.data.data);
      } catch {
        console.error('Failed to fetch industries');
      }
    };
    fetchIndustries();
  }, []);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await usScreenerApi.getStats();
        setStats(response.data.data);
      } catch {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  // Fetch screener data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filterWithSearch = {
        ...filter,
        search: debouncedSearch || undefined,
      };

      const response = await usScreenerApi.filterScreenerData(filterWithSearch);
      setStocks(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch US screener data:', error);
      toast.error('Failed to load US screener data');
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch]);

  useEffect(() => {
    setFilter(prev => ({...prev, page: 0 }));
  }, [debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (field: SortField) => {
    const isAsc = filter.sortBy === field && filter.sortDirection === 'asc';
    setFilter({
      ...filter,
      sortBy: field,
      sortDirection: isAsc ? 'desc' : 'asc',
      page: 0,
    });
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setFilter({ ...filter, page: newPage });
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({
      ...filter,
      size: parseInt(event.target.value, 10),
      page: 0,
    });
  };

  const handleFilterChange = (newFilter: UsScreenerFilter) => {
    setFilter({ ...newFilter, page: 0 });
  };

  const handleRefresh = () => {
    fetchData();
    toast.success('Data refreshed');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filter.sectors && filter.sectors.length > 0) count++;
    if (filter.industries && filter.industries.length > 0) count++;
    if (filter.minMarketCap || filter.maxMarketCap) count++;
    if (filter.minPrice || filter.maxPrice) count++;
    if (filter.minGain1D || filter.maxGain1D) count++;
    if (filter.minGain5D || filter.maxGain5D) count++;
    if (filter.minGain1M || filter.maxGain1M) count++;
    if (filter.minGain3M || filter.maxGain3M) count++;
    if (filter.minGain6M || filter.maxGain6M) count++;
    if (filter.minGain1Y || filter.maxGain1Y) count++;
    if (filter.minGain5Y || filter.maxGain5Y) count++;
    if (filter.near52WeekHigh) count++;
    if (filter.near52WeekLow) count++;
    if (filter.bullishOnly) count++;
    return count;
  };

  const renderSortLabel = (field: SortField, label: string) => (
    <TableSortLabel
      active={filter.sortBy === field}
      direction={filter.sortBy === field ? filter.sortDirection : 'asc'}
      onClick={() => handleSort(field)}
    >
      {label}
    </TableSortLabel>
  );

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              US Stock Screener
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Screen and filter US stocks by price, market cap, gains, and more
            </Typography>
          </Box>
          {stats && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<TrendingUp />}
                label={`${stats.totalStocks.toLocaleString()} Stocks`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<Business />}
                label={`${stats.sectorsCount} Sectors`}
                variant="outlined"
              />
            </Box>
          )}
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent sx={{ p: 2 }}>
            {/* Search and Filter Bar */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search by symbol or company name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flexGrow: 1, minWidth: 300 }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Badge badgeContent={getActiveFiltersCount()} color="primary">
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  Filters
                </Button>
              </Badge>
              <Tooltip title="Refresh data">
                <IconButton onClick={handleRefresh} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Table */}
            <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      '& th': {
                        backgroundColor: 'background.paper',
                        fontWeight: 'bold',
                      },
                    }}
                  >
                    <TableCell sx={{ minWidth: 200 }}>
                      {renderSortLabel('symbol', 'Stock')}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 120 }}>
                      {renderSortLabel('marketCap', 'Market Cap')}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 100 }}>
                      {renderSortLabel('ltp', 'LTP')}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 80 }}>
                      {renderSortLabel('gain1D', '1D')}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 80 }}>
                      {renderSortLabel('gain5D', '5D')}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 80 }}>
                      {renderSortLabel('gain1M', '1M')}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 80 }}>
                      {renderSortLabel('gain3M', '3M')}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 80 }}>
                      {renderSortLabel('gain6M', '6M')}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 80 }}>
                      {renderSortLabel('gain1Y', '1Y')}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 80 }}>
                      {renderSortLabel('gain5Y', '5Y')}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 100 }}>
                      {renderSortLabel('volume', 'Volume')}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 100 }}>
                      52W H
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 100 }}>
                      52W L
                    </TableCell>
                    <TableCell sx={{ minWidth: 130 }}>
                      {renderSortLabel('sector', 'Sector')}
                    </TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      {renderSortLabel('industry', 'Industry')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={15} align="center" sx={{ py: 8 }}>
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          Loading stocks...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : stocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" color="text.secondary">
                          No stocks found matching your criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    stocks.map((stock) => (
                      <TableRow
                        key={stock.id}
                        hover
                        sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {stock.symbol}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: 'block',
                                maxWidth: 180,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {stock.companyName || '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatMarketCap(stock.marketCap)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={500}>
                            {formatPrice(stock.ltp)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <GainCell value={stock.gain1D} />
                        </TableCell>
                        <TableCell align="right">
                          <GainCell value={stock.gain5D} />
                        </TableCell>
                        <TableCell align="right">
                          <GainCell value={stock.gain1M} />
                        </TableCell>
                        <TableCell align="right">
                          <GainCell value={stock.gain3M} />
                        </TableCell>
                        <TableCell align="right">
                          <GainCell value={stock.gain6M} />
                        </TableCell>
                        <TableCell align="right">
                          <GainCell value={stock.gain1Y} />
                        </TableCell>
                        <TableCell align="right">
                          <GainCell value={stock.gain5Y} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatVolume(stock.volume)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatPrice(stock.fiftyTwoWeekHigh)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatPrice(stock.fiftyTwoWeekLow)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 120,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {stock.sector || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              maxWidth: 140,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {stock.industry || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalElements}
              page={filter.page || 0}
              onPageChange={handlePageChange}
              rowsPerPage={filter.size || 50}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[25, 50, 100, 200]}
              labelRowsPerPage="Rows per page:"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter Drawer */}
      <USScreenerFilters
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filter={filter}
        onFilterChange={handleFilterChange}
        sectors={sectors}
        industries={industries}
      />
    </Box>
  );
};

export default USScreener;
