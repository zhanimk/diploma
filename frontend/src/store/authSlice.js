import { createSlice } from '@reduxjs/toolkit';

// Load user data from localStorage
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
    // This reducer is now the single source of truth for setting user data.
    setUser: (state, action) => {
      // When updating user info (like profile), the token might not be in the payload.
      // To preserve the token, we merge the new user data from the action payload
      // with the existing user data in the state.
      const updatedUser = { ...state.user, ...action.payload };

      state.user = updatedUser;
      state.isAuthenticated = !!updatedUser;
      
      // Save the complete, merged user data back to localStorage.
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
