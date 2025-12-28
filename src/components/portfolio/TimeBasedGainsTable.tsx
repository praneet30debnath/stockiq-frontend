import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from '@mui/material';
import { formatCurrency, formatPercent, getChangeColor } from '@/utils/formatters';
import { TimeBasedPortfolio, PeriodGain } from '@/types';

interface TimeBasedGainsTableProps {
  data: TimeBasedPortfolio | null;
  loading: boolean;
  onRefresh?: () => void;
}

interface PeriodCellProps {
  period: PeriodGain | null;
}

const PeriodCell: React.FC<PeriodCellProps> = React.memo(({ period }) => {
  if (!period || !period.applicable) {
    return (
      <Typography variant="body2" color="text.secondary" align="right">
        N/A
      </Typography>
    );
  }

  const color = getChangeColor(period.gainPercent);

  return (
    <Box sx={{ textAlign: 'right' }}>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ color }}
      >
        {formatPercent(period.gainPercent)}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color, fontSize: '0.7rem', display: 'block', mt: 0.25 }}
      >
        {formatCurrency(period.gainAmount)}
      </Typography>
    </Box>
  );
});

PeriodCell.displayName = 'PeriodCell';

export const TimeBasedGainsTable: React.FC<TimeBasedGainsTableProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.holdings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="body2" color="text.secondary">
          No holdings data available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      sx={{
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0,0,0,0.05)',
        },
      }}
    >
      <Table sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
            <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>
              Stock
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, minWidth: 100, display: { xs: 'none', sm: 'table-cell' } }}>
              Invested
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, minWidth: 100 }}>
              Current
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, minWidth: 90 }}>
              1D
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, minWidth: 90, display: { xs: 'none', md: 'table-cell' } }}>
              5D
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, minWidth: 90 }}>
              1M
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, minWidth: 90, display: { xs: 'none', md: 'table-cell' } }}>
              3M
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, minWidth: 90, display: { xs: 'none', md: 'table-cell' } }}>
              6M
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, minWidth: 90 }}>
              1Y
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, minWidth: 90, display: { xs: 'none', md: 'table-cell' } }}>
              3Y
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, minWidth: 90 }}>
              5Y
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, minWidth: 100 }}>
              All Time
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.holdings.map((holding) => (
            <TableRow
              key={holding.id}
              hover
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  cursor: 'default',
                },
              }}
            >
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {holding.symbol}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {holding.companyName}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                <Typography variant="body2">
                  {formatCurrency(holding.invested)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(holding.currentValue)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <PeriodCell period={holding.oneDay} />
              </TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                <PeriodCell period={holding.fiveDays} />
              </TableCell>
              <TableCell align="right">
                <PeriodCell period={holding.oneMonth} />
              </TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                <PeriodCell period={holding.threeMonths} />
              </TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                <PeriodCell period={holding.sixMonths} />
              </TableCell>
              <TableCell align="right">
                <PeriodCell period={holding.oneYear} />
              </TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                <PeriodCell period={holding.threeYears} />
              </TableCell>
              <TableCell align="right">
                <PeriodCell period={holding.fiveYears} />
              </TableCell>
              <TableCell align="right">
                <PeriodCell period={holding.allTime} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
