import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/backend';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Login failed');
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return { success: false, message: err.message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Registration failed');
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return { success: false, message: err.message };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'techbharat-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
