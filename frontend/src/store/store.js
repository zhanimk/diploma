import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tournamentReducer from './tournamentSlice';
import applicationReducer from './applicationSlice';
import clubReducer from './clubSlice';
import footerReducer from './footerSlice'; // <-- Импортируем новый редьюсер

const store = configureStore({
    reducer: {
        auth: authReducer,
        tournaments: tournamentReducer,
        applications: applicationReducer,
        clubs: clubReducer,
        footer: footerReducer, // <-- Добавляем редьюсер в store
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
