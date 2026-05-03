import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL + '/api' || 'http://localhost:8000/api' });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('sb_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default API;
