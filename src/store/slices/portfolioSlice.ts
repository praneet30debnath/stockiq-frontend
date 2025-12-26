import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Portfolio, Holding } from '@/types';

interface PortfolioState {
  data: Portfolio | null;
  selectedHolding: Holding | null;
  loading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  data: null,
  selectedHolding: null,
  loading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolio: (state, action: PayloadAction<Portfolio>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedHolding: (state, action: PayloadAction<Holding | null>) => {
      state.selectedHolding = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearPortfolio: (state) => {
      state.data = null;
      state.selectedHolding = null;
    },
  },
});

export const { setPortfolio, setSelectedHolding, setLoading, setError, clearPortfolio } =
  portfolioSlice.actions;
export default portfolioSlice.reducer;
