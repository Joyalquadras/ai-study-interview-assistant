import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE,
});

// Add request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data.tokens;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/update-profile', data),
  refreshToken: (refreshToken) =>
    apiClient.post('/auth/refresh-token', { refreshToken }),
};

// Notes API
export const notesAPI = {
  getNotes: (params) => apiClient.get('/notes', { params }),
  getNote: (id) => apiClient.get(`/notes/${id}`),
  uploadNote: (formData) =>
    apiClient.post('/notes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  generateContent: (noteId, type) => apiClient.post('/notes/generate-content', { noteId, type }),
  updateNote: (id, data) => apiClient.put(`/notes/${id}`, data),
  deleteNote: (id) => apiClient.delete(`/notes/${id}`),
};

// Chat API
export const chatAPI = {
  getHistory: () => apiClient.get('/chat/history'),
  sendMessage: (data) => apiClient.post('/chat/message', data),
  getChats: (params) => apiClient.get('/chats', { params }),
  getChat: (chatId) => apiClient.get(`/chats/${chatId}`),
  createChat: (data) => apiClient.post('/chats', data),
  sendChatMessage: (chatId, message) =>
    apiClient.post(`/chats/${chatId}/message`, { message }),
  deleteChat: (chatId) => apiClient.delete(`/chats/${chatId}`),
  togglePin: (chatId) => apiClient.put(`/chats/${chatId}/toggle-pin`),
};

// Resume API
export const resumeAPI = {
  analyze: (data) => apiClient.post('/resume/analyze', data),
  analyzeResume: (noteId) =>
    apiClient.post(`/resume/${noteId}/analyze`),
  getAnalysis: (noteId) => apiClient.get(`/resume/${noteId}`),
  getAllAnalyses: (params) => apiClient.get('/resume', { params }),
};

// Study Plan API
export const studyPlanAPI = {
  generatePlan: (data) => apiClient.post('/study-plan/generate', data),
  getMyPlans: () => apiClient.get('/study-plan/my-plans'),
  getPlans: (params) => apiClient.get('/study-plans', { params }),
  getPlan: (id) => apiClient.get(`/study-plans/${id}`),
  createPlan: (data) => apiClient.post('/study-plans', data),
  updatePlan: (id, data) => apiClient.put(`/study-plans/${id}`, data),
  updateTask: (id, taskIndex, data) =>
    apiClient.put(`/study-plans/${id}/task/${taskIndex}`, data),
  deletePlan: (id) => apiClient.delete(`/study-plans/${id}`),
};

// Interview API
export const interviewAPI = {
  start: (data) => apiClient.post('/interview/start', data),
  respond: (data) => apiClient.post('/interview/respond', data),
  end: (data) => apiClient.post('/interview/end', data),
  getInterviews: (params) => apiClient.get('/interviews', { params }),
  getInterview: (id) => apiClient.get(`/interviews/${id}`),
  startInterview: (data) => apiClient.post('/interviews/start', data),
  submitResponse: (id, questionId, data) =>
    apiClient.post(`/interviews/${id}/submit-response/${questionId}`, data),
  completeInterview: (id) => apiClient.put(`/interviews/${id}/complete`),
  deleteInterview: (id) => apiClient.delete(`/interviews/${id}`),
};

// Gap Analyzer API
export const gapAnalyzerAPI = {
  analyze: (data) => apiClient.post('/gap-analyzer', data),
  getHistory: () => apiClient.get('/gap-analyzer/history'),
};

// STAR Stories API
export const starStoriesAPI = {
  getStories: () => apiClient.get('/star-stories'),
  createStory: (data) => apiClient.post('/star-stories', data),
  deleteStory: (id) => apiClient.delete(`/star-stories/${id}`),
};

// Quiz API
export const quizAPI = {
  submitAnswer: (data) => apiClient.post('/quiz/submit-answer', data),
  getAnalytics: () => apiClient.get('/quiz/analytics'),
};

// Streak API
export const streakAPI = {
  getToday: () => apiClient.get('/streak/today'),
  completeChallenge: (data) => apiClient.post('/streak/complete', data),
};

export default apiClient;
