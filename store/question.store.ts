import { create } from 'zustand';
import { Question, QuestionFilterRequest } from '@/types/api';

interface QuestionState {
  questions: Question[];
  currentQuestion: Question | null;
  filters: QuestionFilterRequest;
  isLoading: boolean;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setFilters: (filters: QuestionFilterRequest) => void;
  setLoading: (loading: boolean) => void;
  clearQuestions: () => void;
}

export const useQuestionStore = create<QuestionState>((set) => ({
  questions: [],
  currentQuestion: null,
  filters: {},
  isLoading: false,
  setQuestions: (questions) => set({ questions }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setFilters: (filters) => set({ filters }),
  setLoading: (isLoading) => set({ isLoading }),
  clearQuestions: () => set({ questions: [], currentQuestion: null }),
}));

