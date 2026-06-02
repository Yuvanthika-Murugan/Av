import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  withCredentials: true
});

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/update-profile', data),
  changePassword: (data) => API.put('/auth/change-password', data)
};

// Posts
export const postAPI = {
  getFeed: (params) => API.get('/posts', { params }),
  createPost: (formData) => API.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyPosts: (params) => API.get('/posts/my-posts', { params }),
  getPost: (id) => API.get(`/posts/${id}`),
  updatePost: (id, formData) => API.put(`/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePost: (id) => API.delete(`/posts/${id}`),
  toggleLike: (id) => API.post(`/posts/${id}/like`),
  addComment: (id, data) => API.post(`/posts/${id}/comment`, data),
  getComments: (id) => API.get(`/posts/${id}/comments`)
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getAllPosts: (params) => API.get('/admin/posts', { params }),
  approvePost: (id) => API.put(`/admin/posts/${id}/approve`),
  rejectPost: (id, data) => API.put(`/admin/posts/${id}/reject`, data),
  deletePost: (id) => API.delete(`/admin/posts/${id}`),
  getAllUsers: (params) => API.get('/admin/users', { params }),
  blockUser: (id, data) => API.put(`/admin/users/${id}/block`, data),
  unblockUser: (id) => API.put(`/admin/users/${id}/unblock`),
  deleteComment: (id) => API.delete(`/admin/comments/${id}`)
};

// Logs
export const logAPI = {
  getLogs: (params) => API.get('/logs', { params }),
  getMySessions: () => API.get('/logs/my-sessions')
};

export default API;
