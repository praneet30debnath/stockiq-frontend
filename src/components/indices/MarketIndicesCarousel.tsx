import { useState, useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography, Chip, CircularProgress, Alert, IconButton } from '@mui/material';
import { TrendingUp, TrendingDown, Circle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercent, getChangeColor } from '@/utils/formatters';
import { stocksApi } from '@/api/endpoints/stocks.api';
import { MarketIndex } from '@/types';
import { getMarketStatus } from '@/utils/marketStatus';

const IndexCard = ({ index, delay }: { index: MarketIndex; delay: number }) => {
  const color = getChangeColor(index.changePercent);
  const isPositive = index.changePercent >= 0;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      sx={{
        width: '100%',
      }}
    >
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}20`,
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{
                  display: 'block',
                  mb: 0.5,
                }}
              >
                {index.name}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  mb: 0.5,
                }}
              >
                {formatCurrency(index.currentPrice)}
              </Typography>
              <Chip
                icon={isPositive ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
                label={formatPercent(index.changePercent)}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  background: `${color}15`,
                  color: color,
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: color,
                    marginLeft: '4px',
                  },
                }}
              />
            </Box>
            <Box
              sx={{
                width: 40,
                height: 40,
                minWidth: 40,
                borderRadius: '10px',
                background: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPositive ? (
                <TrendingUp sx={{ color: 'white', fontSize: 24 }} />
              ) : (
                <TrendingDown sx={{ color: 'white', fontSize: 24 }} />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export const MarketIndicesCarousel = () => {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToColumn = (columnIndex: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const columnWidth = container.offsetWidth;
      container.scrollTo({
        left: columnWidth * columnIndex,
        behavior: 'smooth',
      });
      setActiveColumn(columnIndex);
    }
  };

  const fetchIndices = async (silentRefresh = false) => {
    try {
      if (!silentRefresh) {
        setLoading(true);
      }
      const response = await stocksApi.getMarketIndices();
      setIndices(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching market indices:', err);
      if (!silentRefresh) {
        setError(err.response?.data?.message || 'Failed to fetch market indices');
      }
    } finally {
      if (!silentRefresh) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchIndices();
  }, []);

  // Auto-refresh indices every 15 seconds when market is open
  useEffect(() => {
    const interval = setInterval(() => {
      const marketStatus = getMarketStatus();

      if (marketStatus.isOpen) {
        // Market is open - refresh indices
        fetchIndices(true); // true = silent refresh (no loading spinner)
      }
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll through columns every 3 seconds
  useEffect(() => {
    if (indices.length === 0) return;

    const indicesPerColumn = 3;
    const totalColumns = Math.ceil(indices.length / indicesPerColumn);

    if (totalColumns <= 1) return; // No need to auto-scroll if only 1 column

    const interval = setInterval(() => {
      setActiveColumn((prev) => {
        const nextColumn = (prev + 1) % totalColumns;
        scrollToColumn(nextColumn);
        return nextColumn;
      });
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [indices.length]);

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5, lg: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Market Indices
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5, lg: 3 } }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Market Indices
          </Typography>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Group indices into columns of 3 for desktop only
  const indicesPerColumn = 3;
  const columnsOfIndices = [];
  for (let i = 0; i < indices.length; i += indicesPerColumn) {
    columnsOfIndices.push(indices.slice(i, i + indicesPerColumn));
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5, lg: 3 } }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Market Indices
        </Typography>
        {/* Horizontal scroll with columns (both mobile and desktop) */}
        <Box
          ref={scrollContainerRef}
          sx={{
            mt: 2,
            display: 'flex',
            gap: 0,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {indices.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, width: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                No market indices available at the moment.
              </Typography>
            </Box>
          ) : (
            columnsOfIndices.map((columnIndices, columnIdx) => (
              <Box
                key={columnIdx}
                sx={{
                  flex: '0 0 100%',
                  scrollSnapAlign: 'start',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                {columnIndices.map((index, i) => (
                  <IndexCard key={index.symbol} index={index} delay={0.1 * (columnIdx * indicesPerColumn + i)} />
                ))}
              </Box>
            ))
          )}
        </Box>

        {/* Navigation Dots - only on desktop */}
        {columnsOfIndices.length > 1 && (
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, justifyContent: 'center', gap: 1, mt: 2 }}>
            {columnsOfIndices.map((_, idx) => (
              <IconButton
                key={idx}
                onClick={() => scrollToColumn(idx)}
                size="small"
                sx={{
                  p: 0,
                  minWidth: 'auto',
                  width: 24,
                  height: 24,
                }}
              >
                <Circle
                  sx={{
                    fontSize: 12,
                    color: activeColumn === idx ? 'primary.main' : 'action.disabled',
                    transition: 'color 0.3s ease',
                  }}
                />
              </IconButton>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
