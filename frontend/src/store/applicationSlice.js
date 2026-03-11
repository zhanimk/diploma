
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Получение ВСЕХ заявок
export const getApplications = createAsyncThunk(
    'applications/getApplications',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/api/applications');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Could not fetch applications');
        }
    }
);

// 2. Получение ДЕТАЛЬНОЙ информации по одной заявке
export const getApplicationDetails = createAsyncThunk(
    'applications/getApplicationDetails',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/api/applications/${id}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Could not fetch application details');
        }
    }
);

// 3. Обновление СТАТУСА заявки (APPROVED/REJECTED)
export const updateApplicationStatus = createAsyncThunk(
    'applications/updateApplicationStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/applications/${id}`, { status });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Could not update status');
        }
    }
);

// 4. Обновление данных СПОРТСМЕНА в заявке
export const updateAthleteInApplication = createAsyncThunk(
    'applications/updateAthleteInApplication',
    async ({ applicationId, athleteEntryId, payload }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/applications/${applicationId}/athlete/${athleteEntryId}`, payload);
            return { updatedAthlete: data, athleteEntryId }; // Возвращаем и обновленные данные, и ID для поиска
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Could not update athlete');
        }
    }
);


const applicationSlice = createSlice({
    name: 'applications',
    initialState: {
        applications: [],        // Список всех заявок
        selectedApplication: null, // Детальные данные одной заявки
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Редьюсеры для getApplications (уже были)
            .addCase(getApplications.pending, (state) => {
                state.loading = true;
            })
            .addCase(getApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.applications = action.payload;
                state.error = null;
            })
            .addCase(getApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Редьюсеры для getApplicationDetails (НОВЫЕ)
            .addCase(getApplicationDetails.pending, (state) => {
                state.loading = true;
                state.selectedApplication = null; // Очищаем перед загрузкой
            })
            .addCase(getApplicationDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedApplication = action.payload;
                state.error = null;
            })
            .addCase(getApplicationDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Редьюсеры для updateApplicationStatus (НОВЫЕ)
            .addCase(updateApplicationStatus.fulfilled, (state, action) => {
                 if (state.selectedApplication) {
                    state.selectedApplication.status = action.payload.status;
                 }
            })

            // Редьюсеры для updateAthleteInApplication (НОВЫЕ)
            .addCase(updateAthleteInApplication.fulfilled, (state, action) => {
                if (state.selectedApplication) {
                    const { updatedAthlete, athleteEntryId } = action.payload;
                    const athleteIndex = state.selectedApplication.athletes.findIndex(ae => ae._id === athleteEntryId);
                    if (athleteIndex !== -1) {
                        state.selectedApplication.athletes[athleteIndex] = { ...state.selectedApplication.athletes[athleteIndex], ...updatedAthlete };
                    }
                }
            });
    },
});

export default applicationSlice.reducer;
