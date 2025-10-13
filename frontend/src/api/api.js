import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on auth check endpoint
    if (error.response?.status === 401 && !error.config.url.includes('/auth/check')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
