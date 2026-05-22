import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  isDarkMode: localStorage.getItem('theme') === 'dark' || false,

  toggleTheme: () => {
    set((state) => {
      const newDarkMode = !state.isDarkMode;
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');

      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      return { isDarkMode: newDarkMode };
    });
  },

  initTheme: () => {
    const isDark = localStorage.getItem('theme') === 'dark';
    set({ isDarkMode: isDark });

    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  },
}));
