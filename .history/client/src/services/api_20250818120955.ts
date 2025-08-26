import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Use explicit URL
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chatToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json'; // Add content type
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('chatToken');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;