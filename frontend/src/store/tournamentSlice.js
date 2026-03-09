import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  tournaments: [],
  tournament: null,
  loading: false,
  error: null,
};

export const getTournaments = createAsyncThunk('tournaments/getTournaments', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get('/api/tournaments');
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const getTournamentById = createAsyncThunk('tournaments/getTournamentById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`/api/tournaments/${id}`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const registerForTournament = createAsyncThunk('tournaments/registerForTournament', async ({ id, weightCategory, ageCategory }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`/api/tournaments/${id}/register`, { weightCategory, ageCategory });
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const generateGrid = createAsyncThunk('tournaments/generateGrid', async (id, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`/api/tournaments/${id}/grid`);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const updateMatchResult = createAsyncThunk('tournaments/updateMatchResult', async ({ id, category, matchId, winnerId }, { rejectWithValue }) => {
  try {
    const { data } = await axios.put(`/api/tournaments/${id}/grid`, { category, matchId, winnerId });
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const tournamentSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTournaments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = action.payload;
      })
      .addCase(getTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTournamentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTournamentById.fulfilled, (state, action) => {
        state.loading = false;
        state.tournament = action.payload;
      })
      .addCase(getTournamentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerForTournament.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerForTournament.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the tournament data
      })
      .addCase(registerForTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generateGrid.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateGrid.fulfilled, (state, action) => {
        state.loading = false;
        state.tournament.grid = action.payload.grid;
      })
      .addCase(generateGrid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMatchResult.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMatchResult.fulfilled, (state, action) => {
        state.loading = false;
        state.tournament.grid = action.payload.grid;
      })
      .addCase(updateMatchResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default tournamentSlice.reducer;
