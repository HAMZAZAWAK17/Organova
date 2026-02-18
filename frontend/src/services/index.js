import api from './api';

export const taskService = {
    list: (params) => api.get('/tasks', { params }),
    get: (id) => api.get(`/tasks/${id}`),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    remove: (id) => api.delete(`/tasks/${id}`),
};

export const categoryService = {
    list: () => api.get('/categories'),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    remove: (id) => api.delete(`/categories/${id}`),
};

export const commentService = {
    list: (taskId) => api.get(`/tasks/${taskId}/comments`),
    add: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
    remove: (taskId, id) => api.delete(`/tasks/${taskId}/comments/${id}`),
};

export const notificationService = {
    list: () => api.get('/notifications'),
    markRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch('/notifications/read-all'),
};

export const userService = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.put('/users/change-password', data),
};
