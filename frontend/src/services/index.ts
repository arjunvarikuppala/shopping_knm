import api from './api';
import type { ApiResponse, User, AuthTokens } from '@/types';

export const authApi = {
  sendOtp: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<{ message: string; requiresOtp: boolean; email: string }>>('/auth/send-otp', data),

  verifyOtp: (data: { name: string; email: string; password: string; otp: string }) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/verify-otp', data),

  resendOtp: (email: string) =>
    api.post<ApiResponse<{ message: string }>>('/auth/resend-otp', { email }),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', data),

  googleLogin: (data: { credential: string }) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/google', data),

  logout: () => api.post('/auth/logout'),

  forgotPassword: (email: string) => api.post<ApiResponse>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse>('/auth/reset-password', { token, password }),
};

export const productApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<ApiResponse>('/products', { params }),

  getFeatured: () => api.get<ApiResponse>('/products/featured'),

  getNewArrivals: () => api.get<ApiResponse>('/products/new-arrivals'),

  getById: (id: string) => api.get<ApiResponse>(`/products/${id}`),

  create: (data: Record<string, unknown>) => api.post<ApiResponse>('/products', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse>(`/products/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/products/${id}`),

  updateStock: (id: string, stock: number) =>
    api.patch<ApiResponse>(`/products/${id}/stock`, { stock }),
};

export const categoryApi = {
  getAll: (all = false) => api.get<ApiResponse>('/categories', { params: { all } }),

  create: (data: Record<string, unknown>) => api.post<ApiResponse>('/categories', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse>(`/categories/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/categories/${id}`),
};

export const orderApi = {
  create: (data: Record<string, unknown>) => api.post<ApiResponse>('/orders', data),

  getMyOrders: (page = 1) => api.get<ApiResponse>('/orders/my', { params: { page } }),

  getById: (id: string) => api.get<ApiResponse>(`/orders/${id}`),

  cancel: (id: string) => api.patch<ApiResponse>(`/orders/${id}/cancel`),

  getAll: (params?: Record<string, unknown>) => api.get<ApiResponse>('/orders', { params }),

  updateStatus: (id: string, data: Record<string, unknown>) =>
    api.patch<ApiResponse>(`/orders/${id}/status`, data),
};

export const reviewApi = {
  getAll: () => api.get<ApiResponse>('/reviews'),
  getByProduct: (productId: string) => api.get<ApiResponse>(`/reviews/product/${productId}`),

  create: (data: { name?: string; productId?: string; rating: number; comment: string }) =>
    api.post<ApiResponse>('/reviews', data),

  delete: (id: string) => api.delete<ApiResponse>(`/reviews/${id}`),
};

export const userApi = {
  getProfile: () => api.get<ApiResponse>('/users/profile'),

  updateProfile: (data: Record<string, unknown>) => api.put<ApiResponse>('/users/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse>('/users/change-password', data),

  addAddress: (data: Record<string, unknown>) => api.post<ApiResponse>('/users/addresses', data),

  updateAddress: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse>(`/users/addresses/${id}`, data),

  deleteAddress: (id: string) => api.delete<ApiResponse>(`/users/addresses/${id}`),

  getCustomers: (page = 1) => api.get<ApiResponse>('/users/customers', { params: { page } }),

  toggleBlock: (id: string) => api.patch<ApiResponse>(`/users/customers/${id}/toggle-block`),
};

export const adminApi = {
  getDashboard: () => api.get<ApiResponse>('/admin/dashboard'),
};

export const uploadApi = {
  uploadImages: (formData: FormData) =>
    api.post<ApiResponse<{ urls: string[] }>>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
