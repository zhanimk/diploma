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
      // If the payload from login/register contains a token, we merge it with existing state
      // to preserve other details. Otherwise, we assume it's a full profile update and replace the user object.
      const updatedUser = action.payload.token 
        ? { ...state.user, ...action.payload }
        : action.payload;

      state.user = updatedUser;
      state.isAuthenticated = !!updatedUser;
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    },
    setClub: (state, action) => {
      if (state.user) {
        // This reducer is used to update club details specifically, e.g., after a coach creates a club
        const updatedUser = { ...state.user, club: action.payload };
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
