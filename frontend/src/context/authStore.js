// frontend/src/context/authStore.js
import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,

  initAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, isAuthenticated: false, isGuest: false });
      return;
    }

    try {
      const response = await authAPI.getMe();
      const user = response.data.data.user;
      set({
        user,
        isAuthenticated: true,
        isGuest: user?.role === 'guest' || user?.email === 'guest@studyai.com',
      });
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isGuest: false });
    }
  },

  register: async (name, email, password, confirmPassword) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.register({
        name,
        email,
        password,
        confirmPassword,
      });

      const { user, tokens } = response.data.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      set({
        user,
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
      });

      return { success: true, user };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login({ email, password });

      const { user, tokens } = response.data.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      set({
        user,
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
      });

      return { success: true, user };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  guestLogin: async () => {
    set({ isLoading: true });
    try {
      const response = await authAPI.guestLogin();
      const { user, tokens, token } = response.data.data;
      const accessToken = tokens?.accessToken || token;
      const refreshToken = tokens?.refreshToken;

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      set({
        user,
        isAuthenticated: true,
        isGuest: true,
        isLoading: false,
      });

      return { success: true, user };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    set({
      user: null,
      isAuthenticated: false,
      isGuest: false,
    });
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.updateProfile(data);
      set({
        user: response.data.data.user,
        isLoading: false,
      });
      return response.data.data.user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setUser: (user) => set({ user }),

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));
