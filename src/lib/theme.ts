import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role } from '../types/auth';

type Theme = 'light' | 'dark';

interface ThemeState {
  themes: Record<Role, Theme>;
  getTheme: (role: Role) => Theme;
  setTheme: (role: Role, theme: Theme) => void;
  toggleTheme: (role: Role) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themes: {
        MEMBER: 'light',
        PARTNER: 'light',
        ADMIN: 'light',
        SUPER_ADMIN: 'light',
      },
      getTheme: (role) => get().themes[role] || 'light',
      setTheme: (role, theme) => 
        set((state) => ({
          themes: {
            ...state.themes,
            [role]: theme,
          },
        })),
      toggleTheme: (role) =>
        set((state) => ({
          themes: {
            ...state.themes,
            [role]: state.themes[role] === 'light' ? 'dark' : 'light',
          },
        })),
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ themes: state.themes }),
    }
  )
);