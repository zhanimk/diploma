import { createSlice } from '@reduxjs/toolkit';

// Попробуем загрузить данные пользователя из localStorage
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const initialState = {
  user: userInfoFromStorage,
  isAuthenticated: !!userInfoFromStorage,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      // Сохраняем данные пользователя в localStorage
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      // Удаляем данные пользователя из localStorage
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
