import axios from 'axios';

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5000/api`;
    }
    return 'http://localhost:5000/api';
  }
  return process.env.REACT_APP_API_URL || '/api';
};

const API_URL = getApiUrl();

console.log('API URL:', API_URL);
console.log('Current hostname:', window.location.hostname);
console.log('Current origin:', window.location.origin);

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      console.error('Authentication error:', error.response?.data);

    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

