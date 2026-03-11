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

// Async thunk for deleting a club
export const deleteClub = createAsyncThunk(
    'clubs/deleteClub',
    async (clubId, { getState, rejectWithValue }) => {
        try {
            const { user: { userInfo } } = getState();
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
        loading: false,
        error: null,
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
            // Delete club reducers
            .addCase(deleteClub.pending, (state) => {
                // Optionally, you can set a specific loading state for deletion
                state.loading = true; 
            })
            .addCase(deleteClub.fulfilled, (state, action) => {
                state.loading = false;
                // Filter out the deleted club from the state
                state.clubs = state.clubs.filter(club => club._id !== action.payload);
                state.error = null;
            })
            .addCase(deleteClub.rejected, (state, action) => {
                state.loading = false;
                // It's good practice to show the error message for the failed deletion
                state.error = action.payload;
            });
    },
});

export default clubSlice.reducer;
