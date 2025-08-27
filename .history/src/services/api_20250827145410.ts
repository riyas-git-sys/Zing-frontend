// client/src/services/api.ts
import axios from 'axios';

// Determine base URL based on environment
const isProduction = import.meta.env.PROD;
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chatToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (config.method === 'get' || config.method === 'GET') {
    config.withCredentials = true;
  } else {
    // For POST/PUT/DELETE, don't use withCredentials to avoid preflight
    config.withCredentials = false;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ message: 'Request timeout' });
    }
    
    if (!error.response) {
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    }
    
    if (error.response.status === 401) {
      localStorage.removeItem('chatToken');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    
    return Promise.reject(error.response.data);
  }
);

// Add proper DELETE method with data support
export const deleteWithData = (url: string, data: any) => {
  return api.delete(url, { data, withCredentials: false });
};

// For regular DELETE requests without data
export const deleteWithoutData = (url: string) => {
  return api.delete(url, { withCredentials: false });
};

export default api;