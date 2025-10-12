//==== Zustand ====
import { session } from "@/types";

//==== Zustand ====
import { create } from "zustand";

//==== State ====
interface SessionState {
    session: session.CreateMockInterviewResponse | null;
    isLoading: boolean;
    error: session.SessionError | null;
    setSession: (session: session.CreateMockInterviewResponse | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: session.SessionError | null) => void;
    clearSession: () => void;
    clearError: () => void;
}

//==== Store ====
export const useSessionStore = create<SessionState>((set) => ({
    session: null,
    isLoading: false,
    error: null,
    setSession: (session) => set({ session }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearSession: () => set({ session: null, error: null }),
    clearError: () => set({ error: null }),
}));