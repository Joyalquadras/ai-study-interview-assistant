import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Initialize auth state from localStorage
  initAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await authAPI.getMe();
        set({
          user: response.data.data.user,
          isAuthenticated: true,
        });
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ isAuthenticated: false });
      }
    }
  },

  // Register
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
        isLoading: false,
      });

      return { success: true, user };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Login
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
        isLoading: false,
      });

      return { success: true, user };
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Logout
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
    });
  },

  // Update profile
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

  // Set user
  setUser: (user) => set({ user }),

  // Set authenticated
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));
