import axios from 'axios';

// Create a single axios instance for all API calls
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('bmsit_token');
      localStorage.removeItem('bmsit_email');
      localStorage.removeItem('bmsit_role');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Unified API object
export const apiService = {
  // Authentication
  auth: {
    login: (email, password, role = 'teacher') => 
      api.post(`/auth/${role}-login`, { email, password }),
    
    teacherLogin: (email, password) => 
      api.post('/auth/teacher-login', { email, password }),
      
    studentLogin: (email, password) => 
      api.post('/auth/student-login', { email, password }),
      
    staffLogin: (email, password) => 
      api.post('/auth/staff-login', { email, password }),
  },
  
  // Events
  events: {
    getAll: () => api.get('/events'),
    getById: (id) => api.get(`/events/${id}`),
    create: (eventData) => api.post('/events', eventData),
    update: (id, eventData) => api.put(`/events/${id}`, eventData),
    delete: (id) => api.delete(`/events/${id}`),
    getByUser: (userId) => api.get('/events', { params: { userId } }),
  },
  
  // Attendance
  attendance: {
    mark: (data) => api.post('/attendance/mark', data),
    getByEvent: (eventId) => api.get(`/attendance/event/${eventId}`),
    getByStudent: (studentId) => api.get(`/attendance/student/${studentId}`),
  },
  
  // Add other API endpoints as needed
};

// For backward compatibility
export const auth = apiService.auth;
export const events = apiService.events;
export const attendance = apiService.attendance;

export default apiService;
