
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  tournaments: [],
  tournament: null,
  loading: false,
  error: null,
};

// Action to get all tournaments
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

// Action to get a single tournament by ID
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

// Action to create a tournament (for admin)
export const createTournament = createAsyncThunk(
  'tournaments/createTournament',
  async (tournamentData, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post('/api/tournaments', tournamentData, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Action to update a tournament (for admin)
export const updateTournament = createAsyncThunk(
  'tournaments/updateTournament',
  async ({ id, tournamentData }, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.put(`/api/tournaments/${id}`, tournamentData, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Action to delete a tournament (for admin)
export const deleteTournament = createAsyncThunk(
  'tournaments/deleteTournament',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.delete(`/api/tournaments/${id}`, config);
      return id; // Return the ID to remove it from the state
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const tournamentSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {
    resetTournament: (state) => {
        state.tournament = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all tournaments
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
      // Get single tournament
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
      // Create tournament
      .addCase(createTournament.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments.push(action.payload);
      })
      .addCase(createTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update tournament
      .addCase(updateTournament.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = state.tournaments.map((t) => 
            t._id === action.payload._id ? action.payload : t
        );
        state.tournament = action.payload;
      })
      .addCase(updateTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete tournament
      .addCase(deleteTournament.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = state.tournaments.filter(t => t._id !== action.payload);
      })
      .addCase(deleteTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetTournament } = tournamentSlice.actions;
export default tournamentSlice.reducer;
