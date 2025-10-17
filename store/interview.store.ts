import { create } from 'zustand';
import { CreateMockInterviewResponse, FinishInterviewResponse } from '@/types/api';

interface InterviewState {
  currentInterview: CreateMockInterviewResponse | null;
  interviewHistory: FinishInterviewResponse[];
  currentQuestionIndex: number;
  answers: Record<number, { answer: string; timeSpent: number }>;
  isInterviewActive: boolean;
  setCurrentInterview: (interview: CreateMockInterviewResponse | null) => void;
  setInterviewHistory: (history: FinishInterviewResponse[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setAnswer: (questionId: number, answer: string, timeSpent: number) => void;
  setIsInterviewActive: (active: boolean) => void;
  clearInterview: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  currentInterview: null,
  interviewHistory: [],
  currentQuestionIndex: 0,
  answers: {},
  isInterviewActive: false,
  setCurrentInterview: (interview) => set({ currentInterview: interview }),
  setInterviewHistory: (history) => set({ interviewHistory: history }),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setAnswer: (questionId, answer, timeSpent) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: { answer, timeSpent } },
    })),
  setIsInterviewActive: (active) => set({ isInterviewActive: active }),
  clearInterview: () =>
    set({
      currentInterview: null,
      currentQuestionIndex: 0,
      answers: {},
      isInterviewActive: false,
    }),
  nextQuestion: () => {
    const { currentInterview, currentQuestionIndex } = get();
    if (currentInterview && currentQuestionIndex < currentInterview.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },
  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },
}));

