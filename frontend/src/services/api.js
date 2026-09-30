import axios from 'axios';

// Base API configuration - connects to Spring Boot backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT Bearer token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on authentication failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH SERVICE ====================
export const authService = {
  login: async (usernameOrEmail, password) => {
    const res = await api.post('/auth/login', {
      usernameOrEmail: usernameOrEmail.trim(),
      password,
    });
    return res.data?.data || res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data?.data || res.data;
  },
};

// ==================== PRODUCT SERVICE ====================
export const productService = {
  getAll: async () => {
    const res = await api.get('/v1/products');
    return res.data?.data || [];
  },
  getById: async (id) => {
    const res = await api.get(`/v1/products/${id}`);
    return res.data?.data;
  },
  getByCategory: async (categoryId) => {
    const res = await api.get(`/v1/products/category/${categoryId}`);
    return res.data?.data || [];
  },
  getBySupplier: async (supplierId) => {
    const res = await api.get(`/v1/products/supplier/${supplierId}`);
    return res.data?.data || [];
  },
  getLowStock: async () => {
    const res = await api.get('/v1/products/low-stock');
    return res.data?.data || [];
  },
  create: async (formData) => {
    const res = await api.post('/v1/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data;
  },
  update: async (id, formData) => {
    const res = await api.put(`/v1/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/v1/products/${id}`);
    return res.data;
  },
  uploadImages: async (id, formData) => {
    const res = await api.post(`/v1/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data;
  },
  deleteImage: async (id, imageUrl) => {
    const res = await api.delete(`/v1/products/${id}/images`, {
      params: { imageUrl },
    });
    return res.data?.data;
  },
  setPrimaryImage: async (id, imageUrl) => {
    const res = await api.put(`/v1/products/${id}/images/primary`, null, {
      params: { imageUrl },
    });
    return res.data?.data;
  },
};

// ==================== CATEGORY SERVICE ====================
export const categoryService = {
  getAll: async () => {
    const res = await api.get('/v1/categories');
    return res.data?.data || [];
  },
  getById: async (id) => {
    const res = await api.get(`/v1/categories/${id}`);
    return res.data?.data;
  },
  create: async (data) => {
    const res = await api.post('/v1/categories', data);
    return res.data?.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/v1/categories/${id}`, data);
    return res.data?.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/v1/categories/${id}`);
    return res.data;
  },
};

// ==================== SUPPLIER SERVICE ====================
export const supplierService = {
  getAll: async () => {
    const res = await api.get('/v1/suppliers');
    return res.data?.data || [];
  },
  getById: async (id) => {
    const res = await api.get(`/v1/suppliers/${id}`);
    return res.data?.data;
  },
  create: async (data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const res = await api.post('/v1/suppliers', data, { headers });
    return res.data?.data;
  },
  update: async (id, data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const res = await api.put(`/v1/suppliers/${id}`, data, { headers });
    return res.data?.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/v1/suppliers/${id}`);
    return res.data;
  },
};

// ==================== ORDER SERVICE ====================
export const orderService = {
  getAll: async () => {
    const res = await api.get('/v1/orders');
    return res.data?.data || [];
  },
  getById: async (id) => {
    const res = await api.get(`/v1/orders/${id}`);
    return res.data?.data;
  },
  create: async (orderData) => {
    const res = await api.post('/v1/orders', orderData);
    return res.data?.data;
  },
  cancel: async (id) => {
    const res = await api.patch(`/v1/orders/${id}/cancel`);
    return res.data?.data;
  },
};

// ==================== USER SERVICE ====================
export const userService = {
  getAll: async () => {
    const res = await api.get('/v1/users');
    return res.data?.data || [];
  },
  getProfile: async (username) => {
    const res = await api.get(`/v1/users/profile/${username}`);
    return res.data?.data;
  },
  uploadAvatar: async (username, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/v1/users/profile/${username}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data;
  },
  uploadAvatarById: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/v1/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data;
  },
  create: async (userData) => {
    const res = await api.post('/v1/users', userData);
    return res.data?.data;
  },
  update: async (id, userData) => {
    const res = await api.put(`/v1/users/${id}`, userData);
    return res.data?.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/v1/users/${id}`);
    return res.data;
  },
};

export default api;
