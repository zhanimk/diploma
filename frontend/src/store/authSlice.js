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
    setUser: (state, action) => {
      const updatedUser = { ...state.user, ...action.payload };
      state.user = updatedUser;
      state.isAuthenticated = !!updatedUser;
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    },
    setClub: (state, action) => {
      if (state.user && state.user.club) {
        // Merge the updated club data into the existing user state
        const updatedClub = { ...state.user.club, ...action.payload };
        const updatedUser = { ...state.user, club: updatedClub };
        
        state.user = updatedUser;
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setUser, setClub, logout } = authSlice.actions;

export default authSlice.reducer;
