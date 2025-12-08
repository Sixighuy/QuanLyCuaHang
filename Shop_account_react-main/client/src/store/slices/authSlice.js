import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosConfig';

// Async thunks
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // No token, return empty user (not an error)
        return { user: null };
      }
      
      const response = await axiosInstance.get('/auth/me');
      
      // If successful, return user data
      if (response.data && response.data.user) {
        return response.data;
      }
      
      // No user in response
      return { user: null };
    } catch (error) {
      console.error('Load user error:', error);
      
      // If it's a 401/403, token is invalid - remove it
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        return { user: null }; // Return as fulfilled with no user
      }
      
      // If it's a network error or server error, don't remove token
      // Just reject so we can retry later
      if (!error.response) {
        // Network error - don't remove token, might be temporary
        return rejectWithValue('Network error. Please check your connection.');
      }
      
      // Other errors - might be temporary, don't remove token
      return rejectWithValue(error.response?.data?.message || 'Failed to load user');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  initializing: true, // Track if we're loading user from token
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.initializing = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.initializing = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.initializing = false;
        const token = localStorage.getItem('token');
        
        if (action.payload && action.payload.user) {
          // User loaded successfully
          state.user = action.payload.user;
          state.token = token; // Ensure token is set from localStorage
          state.isAuthenticated = true;
        } else {
          // No user found
          state.user = null;
          // If token exists but no user, token might be expired
          // Keep token in state but mark as not authenticated
          state.token = token;
          state.isAuthenticated = false;
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.initializing = false;
        // Only clear auth state if token was actually removed
        const token = localStorage.getItem('token');
        if (!token) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        } else {
          // Token still exists, might be a temporary error
          // Keep the token but mark as not authenticated
          state.user = null;
          state.isAuthenticated = false;
        }
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

