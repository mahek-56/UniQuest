import axios from 'axios';
import { storage } from '../utils/storage';

// In development with Vite proxy: use relative /api/v1 (proxied to localhost:8000)
// In production: use VITE_API_URL env var, fallback to same-origin /api/v1
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request interceptor — attach Bearer token ─────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.get('auth_token');
    // Only attach real JWT tokens, skip mock/demo tokens
    if (token && !token.startsWith('mock_') && !token.startsWith('demo_')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 with token refresh ─────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = storage.get('refresh_token');

      // Only try real refresh tokens
      if (refreshToken && !refreshToken.startsWith('mock_') && !refreshToken.startsWith('demo_')) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const newToken = res.data.access_token;
          storage.set('auth_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          // Refresh failed — clear auth and redirect to login
          storage.remove('auth_token');
          storage.remove('refresh_token');
          storage.remove('user_profile');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
