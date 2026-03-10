
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  tournaments: [],
  tournament: null,
  loading: false,
  error: null,
};

// Action to get all tournaments (for everyone)
export const getTournaments = createAsyncThunk(
  'tournaments/getTournaments',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/tournaments');
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Action to get a single tournament by ID (for everyone)
export const getTournamentById = createAsyncThunk(
  'tournaments/getTournamentById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/tournaments/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// ... (you might have other actions like create, update, delete for admin)

const tournamentSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get all tournaments
      .addCase(getTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = action.payload;
      })
      .addCase(getTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get single tournament by ID
      .addCase(getTournamentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTournamentById.fulfilled, (state, action) => {
        state.loading = false;
        state.tournament = action.payload;
      })
      .addCase(getTournamentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default tournamentSlice.reducer;
