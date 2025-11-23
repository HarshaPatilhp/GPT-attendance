import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bmsit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('bmsit_token');
      localStorage.removeItem('bmsit_email');
      localStorage.removeItem('bmsit_role');
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  teacherLogin: (email, password) => api.post('/auth/teacher-login', { email, password }),
  studentLogin: (email, password) => api.post('/auth/student-login', { email, password }),
  staffLogin: (email, password) => api.post('/auth/staff-login', { email, password }),
};

export const events = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  getByUser: (userId) => api.get(`/events?userId=${userId}`),
};

export const attendance = {
  mark: (data) => api.post('/attendance/mark', data),
  getByEvent: (eventId) => api.get(`/attendance/event/${eventId}`),
  getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
};

export default api;
