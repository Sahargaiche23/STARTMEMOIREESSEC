import axios from 'axios';

const adminApi = axios.create({
  baseURL: 'http://localhost:5000/api'
});

adminApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      sessionStorage.removeItem('admin-token');
      sessionStorage.removeItem('admin-user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default adminApi;
