//==== Zustand ====
import { create } from "zustand";

//==== Types ====
import { auth } from "@/types";

//==== State ====
interface AuthState {
    user: auth.UserLoginResponse | auth.AdminLoginResponse | null;
    isLoading: boolean;
    error: auth.AuthError | null;
    setUser: (user: auth.UserLoginResponse | auth.AdminLoginResponse | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: auth.AuthError | null) => void;
    logout: () => void;
    clearError: () => void;
}

//==== Store ====
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    error: null,
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    logout: () => set({ user: null, error: null }),
    clearError: () => set({ error: null }),
}));