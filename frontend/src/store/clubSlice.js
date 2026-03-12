import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching all clubs
export const getClubs = createAsyncThunk(
    'clubs/getClubs',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/clubs');
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

// Async thunk for fetching a single club by ID
export const getClubById = createAsyncThunk(
    'clubs/getClubById',
    async (clubId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/clubs/${clubId}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);


// Async thunk for deleting a club
export const deleteClub = createAsyncThunk(
    'clubs/deleteClub',
    async (clubId, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState(); // Correctly accessing userInfo from auth state
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.delete(`/api/clubs/${clubId}`, config);
            return clubId; // Return the ID of the deleted club on success
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

const clubSlice = createSlice({
    name: 'clubs',
    initialState: {
        clubs: [],
        club: null, // To store details of a single club
        loading: false,
        error: null,
        loadingDetails: false, // Separate loading for details view
        errorDetails: null,     // Separate error for details view
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Get all clubs reducers
            .addCase(getClubs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getClubs.fulfilled, (state, action) => {
                state.loading = false;
                state.clubs = action.payload;
            })
            .addCase(getClubs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get club by ID reducers
            .addCase(getClubById.pending, (state) => {
                state.loadingDetails = true;
                state.errorDetails = null;
                state.club = null;
            })
            .addCase(getClubById.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.club = action.payload;
            })
            .addCase(getClubById.rejected, (state, action) => {
                state.loadingDetails = false;
                state.errorDetails = action.payload;
            })
            // Delete club reducers
            .addCase(deleteClub.pending, (state) => {
                state.loading = true; 
            })
            .addCase(deleteClub.fulfilled, (state, action) => {
                state.loading = false;
                state.clubs = state.clubs.filter(club => club._id !== action.payload);
                state.error = null;
            })
            .addCase(deleteClub.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default clubSlice.reducer;