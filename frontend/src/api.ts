import axios from 'axios';

// Dynamically determine the best API endpoint
const getApiBaseUrl = () => {

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If running on Render (e.g. polling-frontend-dwg2.onrender.com)
    if (hostname.includes('onrender.com')) {
      return 'https://polling-backend-pyv1.onrender.com/api';
    }
    return `http://${hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

export const API_URL = getApiBaseUrl();
export const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Non-blocking warmup ping to wake up backend immediately on app load
if (typeof window !== 'undefined') {
  fetch(`${API_URL}/health`).catch(() => {});
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config.url?.includes('/login') || error.config.url?.includes('/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export default api;

export const exams = {
  create: (data: any) => api.post('/exams', data),
  getAll: () => api.get('/exams'),
  getById: (id: string) => api.get(`/exams/${id}`),
  submit: (id: string, data: any) => api.post(`/exams/${id}/submit`, data),
  getResults: (id: string) => api.get(`/exams/${id}/results`),
  recordProctorLog: (id: string, data: any) => api.post(`/exams/${id}/proctor-logs`, data),
  getProctorLogs: (id: string) => api.get(`/exams/${id}/proctor-logs`),
};

export const surveys = {
  create: (data: any) => api.post('/surveys', data),
  getAll: () => api.get('/surveys'),
  getById: (id: string) => api.get(`/surveys/${id}`),
  submit: (id: string, answers: any[]) => api.post(`/surveys/${id}/submit`, { answers }),
  getResults: (id: string) => api.get(`/surveys/${id}/results`),
};

export const analytics = {
  getGlobalStats: () => api.get('/analytics'),
  getPollStats: (id: string) => api.get(`/analytics/poll/${id}`),
};
