import { session } from "@/types";
import { api } from "@/lib/axios";
import { handleApiError } from "@/lib/errorHandler";

//==== Session Service ====
export const sessionService = {
    // 현재 진행 중인 면접 조회
    getCurrentSession: async (): Promise<session.CreateMockInterviewResponse | null> => {
        try {
            const response = await api.get("/user/interviews/current");
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 모의면접 생성
    createMockInterview: async (data: session.CreateMockInterviewRequest): Promise<session.CreateMockInterviewResponse> => {
        try {
            const response = await api.post("/user/interviews", data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 랜덤 질문 조회 (간단한 버전)
    getRandomQuestion: async (): Promise<session.CreateMockInterviewResponse> => {
        try {
            const response = await api.get("/user/interviews/random");
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 답변 기록
    recordAnswer: async (interviewId: number, data: session.SessionBySessionQuestionAnswerRecordsRequest): Promise<session.SessionBySessionQuestionAnswerRecordsResponse> => {
        try {
            const response = await api.post(`/user/interviews/${interviewId}/answer`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 면접 완료
    finishInterview: async (interviewId: number): Promise<session.FinishedMockInterviewResponse> => {
        try {
            const response = await api.post(`/user/interviews/${interviewId}/finish`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 면접 히스토리 조회
    getInterviewHistory: async (page = 0, size = 10): Promise<session.FinishedMockInterviewResponse[]> => {
        try {
            const response = await api.get("/user/interviews", {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 특정 면접 조회
    getInterviewById: async (interviewId: number): Promise<session.FinishedMockInterviewResponse> => {
        try {
            const response = await api.get(`/user/interviews/${interviewId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};