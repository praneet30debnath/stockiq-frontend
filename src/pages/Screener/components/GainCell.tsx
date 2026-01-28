import { Box, Typography } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';

interface GainCellProps {
  value: number | null;
  showIcon?: boolean;
  fontSize?: string;
}

const GainCell = ({ value, showIcon = false, fontSize = '0.875rem' }: GainCellProps) => {
  if (value === null || value === undefined) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontSize }}>
        -
      </Typography>
    );
  }

  const isPositive = value > 0;
  const isNegative = value < 0;
  const color = isPositive ? '#22c55e' : isNegative ? '#ef4444' : 'text.secondary';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 0.5,
        color,
      }}
    >
      {showIcon && isPositive && <TrendingUp sx={{ fontSize: '1rem' }} />}
      {showIcon && isNegative && <TrendingDown sx={{ fontSize: '1rem' }} />}
      {showIcon && !isPositive && !isNegative && <Remove sx={{ fontSize: '1rem' }} />}
      <Typography
        variant="body2"
        sx={{
          fontSize,
          fontWeight: 500,
          color: 'inherit',
        }}
      >
        {isPositive ? '+' : ''}{value.toFixed(2)}%
      </Typography>
    </Box>
  );
};

export default GainCell;
