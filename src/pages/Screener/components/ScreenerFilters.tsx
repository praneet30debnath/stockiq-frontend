import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';
import { Close, ExpandMore, FilterAlt, RestartAlt } from '@mui/icons-material';
import { ScreenerFilter } from '@/types';

interface ScreenerFiltersProps {
  open: boolean;
  onClose: () => void;
  filter: ScreenerFilter;
  onFilterChange: (filter: ScreenerFilter) => void;
  industries: string[];
}

const MARKET_CAP_OPTIONS = [
  { label: 'All', min: undefined, max: undefined },
  { label: 'Large Cap (>20,000 Cr)', min: 200000000000, max: undefined },
  { label: 'Mid Cap (5,000-20,000 Cr)', min: 50000000000, max: 200000000000 },
  { label: 'Small Cap (500-5,000 Cr)', min: 5000000000, max: 50000000000 },
  { label: 'Micro Cap (<500 Cr)', min: undefined, max: 5000000000 },
];

const PRICE_OPTIONS = [
  { label: 'All', min: undefined, max: undefined },
  { label: 'Under Rs.100', min: undefined, max: 100 },
  { label: 'Rs.100 - Rs.500', min: 100, max: 500 },
  { label: 'Rs.500 - Rs.1,000', min: 500, max: 1000 },
  { label: 'Rs.1,000 - Rs.5,000', min: 1000, max: 5000 },
  { label: 'Above Rs.5,000', min: 5000, max: undefined },
];

const ScreenerFilters = ({
  open,
  onClose,
  filter,
  onFilterChange,
  industries,
}: ScreenerFiltersProps) => {
  const [localFilter, setLocalFilter] = useState<ScreenerFilter>(filter);

  useEffect(() => {
    setLocalFilter(filter);
  }, [filter]);

  const handleApplyFilters = () => {
    onFilterChange(localFilter);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilter: ScreenerFilter = {
      page: 0,
      size: filter.size || 50,
      sortBy: 'symbol',
      sortDirection: 'asc',
    };
    setLocalFilter(resetFilter);
    onFilterChange(resetFilter);
  };

  const handleMarketTypeChange = (value: 'MAINBOARD' | 'SME' | '') => {
    setLocalFilter({
      ...localFilter,
      marketType: value === '' ? undefined : value,
    });
  };

  const handleIndustriesChange = (values: string[]) => {
    setLocalFilter({
      ...localFilter,
      industries: values.length > 0 ? values : undefined,
    });
  };

  const handleMarketCapChange = (option: typeof MARKET_CAP_OPTIONS[0]) => {
    setLocalFilter({
      ...localFilter,
      minMarketCap: option.min,
      maxMarketCap: option.max,
    });
  };

  const handlePriceChange = (option: typeof PRICE_OPTIONS[0]) => {
    setLocalFilter({
      ...localFilter,
      minPrice: option.min,
      maxPrice: option.max,
    });
  };

  const handleGainChange = (
    period: '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y',
    type: 'min' | 'max',
    value: string
  ) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const key = type === 'min' ? `minGain${period}` : `maxGain${period}`;
    setLocalFilter({
      ...localFilter,
      [key]: numValue,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilter.marketType) count++;
    if (localFilter.industries && localFilter.industries.length > 0) count++;
    if (localFilter.minMarketCap || localFilter.maxMarketCap) count++;
    if (localFilter.minPrice || localFilter.maxPrice) count++;
    if (localFilter.minGain1D || localFilter.maxGain1D) count++;
    if (localFilter.minGain5D || localFilter.maxGain5D) count++;
    if (localFilter.minGain1M || localFilter.maxGain1M) count++;
    if (localFilter.minGain3M || localFilter.maxGain3M) count++;
    if (localFilter.minGain6M || localFilter.maxGain6M) count++;
    if (localFilter.minGain1Y || localFilter.maxGain1Y) count++;
    if (localFilter.minGain5Y || localFilter.maxGain5Y) count++;
    if (localFilter.near52WeekHigh) count++;
    if (localFilter.near52WeekLow) count++;
    return count;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterAlt color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Filters
            </Typography>
            {getActiveFiltersCount() > 0 && (
              <Chip
                label={getActiveFiltersCount()}
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: '0.75rem' }}
              />
            )}
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Filters */}
        <Box sx={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
          {/* Market Type */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Market Type</InputLabel>
            <Select
              value={localFilter.marketType || ''}
              label="Market Type"
              onChange={(e) => handleMarketTypeChange(e.target.value as 'MAINBOARD' | 'SME' | '')}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="MAINBOARD">Mainboard</MenuItem>
              <MenuItem value="SME">SME</MenuItem>
            </Select>
          </FormControl>

          {/* Industries */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Industries</InputLabel>
            <Select
              multiple
              value={localFilter.industries || []}
              onChange={(e) => handleIndustriesChange(e.target.value as string[])}
              input={<OutlinedInput label="Industries" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).slice(0, 2).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                  {(selected as string[]).length > 2 && (
                    <Chip label={`+${selected.length - 2}`} size="small" />
                  )}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: { maxHeight: 300 },
                },
              }}
            >
              {industries.map((industry) => (
                <MenuItem key={industry} value={industry}>
                  {industry}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Market Cap */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={500}>Market Cap</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {MARKET_CAP_OPTIONS.map((option) => (
                  <FormControlLabel
                    key={option.label}
                    control={
                      <Checkbox
                        checked={
                          localFilter.minMarketCap === option.min &&
                          localFilter.maxMarketCap === option.max
                        }
                        onChange={() => handleMarketCapChange(option)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{option.label}</Typography>}
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Price Range */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={500}>Price Range</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {PRICE_OPTIONS.map((option) => (
                  <FormControlLabel
                    key={option.label}
                    control={
                      <Checkbox
                        checked={
                          localFilter.minPrice === option.min &&
                          localFilter.maxPrice === option.max
                        }
                        onChange={() => handlePriceChange(option)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{option.label}</Typography>}
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* 52-Week Range */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={500}>52-Week Range</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={localFilter.near52WeekHigh || false}
                      onChange={(e) =>
                        setLocalFilter({ ...localFilter, near52WeekHigh: e.target.checked || undefined })
                      }
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Near 52-Week High (within 5%)</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={localFilter.near52WeekLow || false}
                      onChange={(e) =>
                        setLocalFilter({ ...localFilter, near52WeekLow: e.target.checked || undefined })
                      }
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Near 52-Week Low (within 5%)</Typography>}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Gain Filters */}
          {(['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'] as const).map((period) => (
            <Accordion key={period}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={500}>{period} Gain Range</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Min %"
                    type="number"
                    size="small"
                    value={localFilter[`minGain${period}` as keyof ScreenerFilter] || ''}
                    onChange={(e) => handleGainChange(period, 'min', e.target.value)}
                    InputProps={{ inputProps: { step: 0.1 } }}
                  />
                  <TextField
                    label="Max %"
                    type="number"
                    size="small"
                    value={localFilter[`maxGain${period}` as keyof ScreenerFilter] || ''}
                    onChange={(e) => handleGainChange(period, 'max', e.target.value)}
                    InputProps={{ inputProps: { step: 0.1 } }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={handleResetFilters}
            fullWidth
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            fullWidth
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ScreenerFilters;
