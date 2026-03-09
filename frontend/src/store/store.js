import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tournamentReducer from './tournamentSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tournaments: tournamentReducer,
  },
});

export default store;
