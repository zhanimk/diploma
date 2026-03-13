import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// --- Async Thunk for fetching footer settings ---
export const fetchFooterSettings = createAsyncThunk(
    'footer/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/settings/footer');
            return data;
        } catch (error) {
            const message = 
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message;
            return rejectWithValue(message);
        }
    }
);

// --- Slice Definition ---
const footerSlice = createSlice({
    name: 'footer',
    initialState: {
        settings: null, // Will hold the footer data object
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFooterSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFooterSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
            })
            .addCase(fetchFooterSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default footerSlice.reducer;
