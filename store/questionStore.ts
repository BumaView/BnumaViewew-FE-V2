//==== Zustand ====
import { create } from "zustand";

//==== Types ====
import { question } from "@/types";
    

//==== State ====
interface QuestionState {
    questions: question.Question[] | null;
    isLoading: boolean;
    error: question.QuestionError | null;
    setQuestions: (questions: question.Question[] | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: question.QuestionError | null) => void;
    clearQuestions: () => void;
    clearError: () => void;
}

//==== Store ====
export const useQuestionStore = create<QuestionState>((set) => ({
    questions: null,
    isLoading: false,
    error: null,
    setQuestions: (questions) => set({ questions }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearQuestions: () => set({ questions: null, error: null }),
    clearError: () => set({ error: null }),
}));