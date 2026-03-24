import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export default api;

export const exams = {
  create: (data: any) => api.post('/exams', data),
  getAll: () => api.get('/exams'),
  getById: (id: string) => api.get(`/exams/${id}`),
  submit: (id: string, answers: number[]) => api.post(`/exams/${id}/submit`, { answers }),
  getResults: (id: string) => api.get(`/exams/${id}/results`),
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
