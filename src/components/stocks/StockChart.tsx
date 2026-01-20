import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Alert, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { stocksApi } from '@/api/endpoints/stocks.api';
import { TimeRange, Exchange } from '@/types';

interface StockChartProps {
  symbol: string;
  dayChange?: number;
  dayChangePercent?: number;
  exchange?: Exchange;
}

interface ChartDataPoint {
  date: string;
  price: number;
  open?: number;
  timestamp: number;
}

export const StockChart: React.FC<StockChartProps> = ({ symbol, dayChange, dayChangePercent, exchange = 'NSE' }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1mo');

  useEffect(() => {
    fetchChartData();
  }, [symbol, timeRange, exchange]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use appropriate interval based on time range
      const interval = timeRange === '1d' ? '5m' :
                       timeRange === '5d' ? '1h' :
                       timeRange === '1mo' || timeRange === '3mo' ? '1d' :
                       timeRange === '6mo' || timeRange === '1y' ? '1d' :
                       '1wk'; // For 3y, 5y, and max

      const response = await stocksApi.getHistoricalData(symbol, timeRange, interval, exchange);

      // If response.data is a string, parse it; otherwise use it directly
      const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

      // Extract timestamps, close prices, and open prices
      const timestamps = data.timestamp || [];
      const indicators = data.indicators?.quote?.[0];
      const closePrices = indicators?.close || [];
      const openPrices = indicators?.open || [];

      // Combine timestamps and prices
      const showYear = timeRange === '1y' || timeRange === '3y' || timeRange === '5y' || timeRange === 'max';

      const chartPoints: ChartDataPoint[] = timestamps
        .map((timestamp: number, index: number) => {
          const price = closePrices[index];
          const open = openPrices[index];
          if (price === null || price === undefined) return null;

          // For 1D chart, show time instead of date
          let dateLabel: string;
          if (timeRange === '1d') {
            dateLabel = new Date(timestamp * 1000).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });
          } else {
            const dateFormat = showYear
              ? { day: '2-digit', month: 'short', year: '2-digit' }
              : { day: '2-digit', month: 'short' };
            dateLabel = new Date(timestamp * 1000).toLocaleDateString('en-IN', dateFormat as any);
          }

          return {
            timestamp,
            date: dateLabel,
            price: parseFloat(price.toFixed(2)),
            open: open !== null && open !== undefined ? parseFloat(open.toFixed(2)) : undefined,
          };
        })
        .filter((point: ChartDataPoint | null) => point !== null);

      setChartData(chartPoints);
    } catch (err: any) {
      console.error('Error fetching chart data:', err);
      setError('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (_: React.MouseEvent<HTMLElement>, newRange: TimeRange | null) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const minPrice = Math.min(...chartData.map((d) => d.price));
  const maxPrice = Math.max(...chartData.map((d) => d.price));

  // For 1D chart, get previous day's close (opening price of first data point)
  const previousDayClose = timeRange === '1d' && chartData.length > 0 && chartData[0].open
    ? chartData[0].open
    : null;

  // For 1D timeframe, use the provided dayChange data if available
  // Otherwise calculate from chart data
  let priceChange: number;
  let priceChangePercent: number;

  if (timeRange === '1d' && dayChange !== undefined && dayChangePercent !== undefined) {
    priceChange = dayChange;
    priceChangePercent = dayChangePercent;
  } else {
    // Yahoo Finance includes an extra reference point at the beginning for ranges like 1mo, 3mo, etc.
    // Skip the first data point for more accurate calculations
    const startIndex = (timeRange !== '1d' && timeRange !== '5d') && chartData.length > 1 ? 1 : 0;

    // For longer time ranges (3mo+), use the opening price of the first trading day
    // For shorter ranges, use the closing price
    const useOpenPrice = timeRange === '3mo' || timeRange === '6mo' || timeRange === '1y' ||
                        timeRange === '3y' || timeRange === '5y' || timeRange === 'max';

    const firstPrice = chartData.length > startIndex
      ? (useOpenPrice && chartData[startIndex].open ? chartData[startIndex].open : chartData[startIndex].price)
      : 0;
    const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
    priceChange = lastPrice - firstPrice;
    priceChangePercent = firstPrice !== 0 ? ((priceChange / firstPrice) * 100) : 0;
  }

  const isPositive = priceChange >= 0;

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Price Chart
            </Typography>
            {chartData.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {timeRange === '1d' ? 'Today' : timeRange === '5d' ? '5 Days' : timeRange === '1mo' ? '1 Month' : timeRange === '3mo' ? '3 Months' : timeRange === '6mo' ? '6 Months' : timeRange === '1y' ? '1 Year' : timeRange === '3y' ? '3 Years' : timeRange === '5y' ? '5 Years' : 'All Time'}:
                </Typography>
                <Chip
                  label={`${isPositive ? '+' : ''}₹${priceChange.toFixed(2)} (${isPositive ? '+' : ''}${priceChangePercent.toFixed(2)}%)`}
                  size="small"
                  sx={{
                    background: `${isPositive ? '#10b981' : '#ef4444'}15`,
                    color: isPositive ? '#10b981' : '#ef4444',
                    fontWeight: 600,
                  }}
                />
              </Box>
            )}
          </Box>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                px: { xs: 1, md: 2 },
                py: 0.5,
                fontSize: '0.75rem',
              },
            }}
          >
            <ToggleButton value="1d">1D</ToggleButton>
            <ToggleButton value="5d">5D</ToggleButton>
            <ToggleButton value="1mo">1M</ToggleButton>
            <ToggleButton value="3mo">3M</ToggleButton>
            <ToggleButton value="6mo">6M</ToggleButton>
            <ToggleButton value="1y">1Y</ToggleButton>
            <ToggleButton value="3y">3Y</ToggleButton>
            <ToggleButton value="5y">5Y</ToggleButton>
            <ToggleButton value="max">ALL</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#666' }}
              stroke="#999"
            />
            <YAxis
              domain={[minPrice * 0.99, maxPrice * 1.01]}
              tick={{ fontSize: 12, fill: '#666' }}
              stroke="#999"
              tickFormatter={(value) => `₹${value.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
              labelFormatter={(label) => `${timeRange === '1d' ? 'Time' : 'Date'}: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            {previousDayClose !== null && (
              <ReferenceLine
                y={previousDayClose}
                stroke="#666"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `Prev Close: ₹${previousDayClose.toFixed(2)}`,
                  position: 'insideTopRight',
                  fill: '#666',
                  fontSize: 12,
                  fontWeight: 600,
                  offset: 10,
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
