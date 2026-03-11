import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tournamentReducer from './tournamentSlice';
import clubReducer from './clubSlice';
import applicationReducer from './applicationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tournaments: tournamentReducer,
    clubs: clubReducer,
    applications: applicationReducer,
  },
});

export default store;
