import { createSlice } from '@reduxjs/toolkit';

// Function to safely get user info from localStorage
const getUserInfoFromStorage = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      // Ensure the parsed object and its token are valid before returning
      if (parsed && typeof parsed === 'object' && parsed.token) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to parse userInfo from localStorage", error);
  }
  return null; // Return null if anything fails
};

const userInfoFromStorage = getUserInfoFromStorage();

const initialState = {
  user: userInfoFromStorage,
  isAuthenticated: !!(userInfoFromStorage && userInfoFromStorage.token),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Handles login and initial user setting
    setUser: (state, action) => {
      const newUserData = action.payload;
      state.user = newUserData;
      state.isAuthenticated = !!newUserData?.token;
      localStorage.setItem('userInfo', JSON.stringify(newUserData));
    },

    // THE FINAL FIX: A dedicated, safe reducer for profile updates.
    updateUser: (state, action) => {
      // This action is specifically for updating the profile.
      // It receives the updated user object from the API, which does NOT contain a token.
      // It must merge the new data without losing the existing token.
      if (state.user && state.user.token) {
        const updatedFields = action.payload;
        
        // Preserve the token explicitly
        const existingToken = state.user.token;

        // Create the new user state by merging
        const newUserState = { 
          ...state.user, 
          ...updatedFields, // Apply updates from the API
          token: existingToken // Ensure the token is not overwritten
        };

        state.user = newUserState;
        localStorage.setItem('userInfo', JSON.stringify(newUserState));
      } else {
        // If for some reason there's no user or token, do nothing to prevent corrupting the state.
        console.error('updateUser was called without a user or token in the state.');
      }
    },

    setClub: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, club: action.payload };
        localStorage.setItem('userInfo', JSON.stringify(state.user));
      }
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setUser, updateUser, setClub, logout } = authSlice.actions;

export default authSlice.reducer;
