import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TableSortLabel,
} from '@mui/material';
import { formatCurrency, formatPercent, getChangeColor } from '@/utils/formatters';
import { Holding } from '@/types';

type SortField = 'symbol' | 'currentValue' | 'gain' | 'gainPercent' | 'dayChange';
type SortOrder = 'asc' | 'desc';

interface DefaultHoldingsTableProps {
  holdings: Holding[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onRowClick: (holding: Holding) => void;
}

export const DefaultHoldingsTable: React.FC<DefaultHoldingsTableProps> = ({
  holdings,
  sortField,
  sortOrder,
  onSort,
  onRowClick,
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
            <TableCell>
              <TableSortLabel
                active={sortField === 'symbol'}
                direction={sortField === 'symbol' ? sortOrder : 'asc'}
                onClick={() => onSort('symbol')}
              >
                <Typography variant="body2" fontWeight={700}>
                  Stock
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2" fontWeight={700}>
                Qty
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2" fontWeight={700}>
                Avg Price
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2" fontWeight={700}>
                Current Price
              </Typography>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortField === 'currentValue'}
                direction={sortField === 'currentValue' ? sortOrder : 'asc'}
                onClick={() => onSort('currentValue')}
              >
                <Typography variant="body2" fontWeight={700}>
                  Current Value
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortField === 'gain'}
                direction={sortField === 'gain' ? sortOrder : 'asc'}
                onClick={() => onSort('gain')}
              >
                <Typography variant="body2" fontWeight={700}>
                  Total Gain
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortField === 'dayChange'}
                direction={sortField === 'dayChange' ? sortOrder : 'asc'}
                onClick={() => onSort('dayChange')}
              >
                <Typography variant="body2" fontWeight={700}>
                  Day Change
                </Typography>
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holdings.map((holding: Holding) => (
            <TableRow
              key={holding.id}
              hover
              onClick={() => onRowClick(holding)}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(99, 102, 241, 0.02)',
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
              <TableCell align="right">
                <Typography variant="body2">{holding.quantity}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {formatCurrency(holding.avgBuyPrice)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(holding.currentPrice)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(holding.currentValue)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Invested: {formatCurrency(holding.invested)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: getChangeColor(holding.gain) }}
                >
                  {formatCurrency(holding.gain)}
                </Typography>
                <Chip
                  label={formatPercent(holding.gainPercent)}
                  size="small"
                  sx={{
                    mt: 0.5,
                    background: `${getChangeColor(holding.gainPercent)}15`,
                    color: getChangeColor(holding.gainPercent),
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: getChangeColor(holding.dayChange) }}
                >
                  {formatCurrency(holding.dayChange)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: getChangeColor(holding.dayChangePercent) }}
                >
                  {formatPercent(holding.dayChangePercent)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
