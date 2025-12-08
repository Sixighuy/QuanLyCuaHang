import axios from 'axios';

// Auto-detect API URL based on current host
// If running on localhost, use localhost:5000
// If running on IP address (mobile access), use the same IP with port 5000
const getApiUrl = () => {
  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    // Get current hostname (could be localhost or IP address)
    const hostname = window.location.hostname;
    // If accessing via IP address, use that IP for API
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5000/api`;
    }
    // Default to localhost for local development
    return 'http://localhost:5000/api';
  }
  // Production: use relative URL or environment variable
  return process.env.REACT_APP_API_URL || '/api';
};

const API_URL = getApiUrl();

// Debug: Log API URL for troubleshooting
console.log('API URL:', API_URL);
console.log('Current hostname:', window.location.hostname);
console.log('Current origin:', window.location.origin);

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.error('Authentication error:', error.response?.data);
      // Optionally clear token and redirect to login
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

