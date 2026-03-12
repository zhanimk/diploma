import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching dashboard stats
export const getAdminStats = createAsyncThunk(
    'admin/getStats',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.get('/api/admin/stats', config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    stats: null,
    loading: false,
    error: null,
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAdminStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAdminStats.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.stats = payload;
            })
            .addCase(getAdminStats.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
            });
    },
});

export default adminSlice.reducer;
