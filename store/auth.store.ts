import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GoogleLoginResponse } from '@/types/api';

interface AuthState {
  user: GoogleLoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: GoogleLoginResponse | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      // isAuthenticated는 persist에서 제외하고 항상 user 기반으로 계산
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.user;
        }
      },
    }
  )
);
