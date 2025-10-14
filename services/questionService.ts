//==== Types ====
import { question } from "@/types";
import { api } from "@/lib/axios";
import { handleApiError } from "@/lib/errorHandler";

//==== Question Service ====
export const questionService = {
    // 전체 질문 목록 조회 (사용자용)
    searchAllQuestions: async (page = 0, size = 10): Promise<question.SearchAllQuestionResponse> => {
        try {
            const response = await api.get("/api/questions", {
                params: { page, size }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 질문 검색
    searchQuestions: async (query: string, page = 0, size = 10): Promise<question.SearchAllQuestionResponse> => {
        try {
            const response = await api.get("/api/questions", {
                params: { query, page, size }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 카테고리별 질문 조회
    searchQuestionByCategory: async (params: question.SearchQuestionByCategoryRequest, page = 0, size = 10): Promise<question.SearchQuestionByCategoryResponse> => {
        try {
            const response = await api.get("/api/questions/search", {
                params: { ...params, page, size }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 질문 상세 조회
    searchQuestionById: async (id: number): Promise<question.SearchQuestionByIdResponse> => {
        try {
            const response = await api.get(`/api/questions/${id}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 랜덤 질문 조회
    randomlySelectInterviewQuestion: async (): Promise<question.RandomlySelectInterviewQuestionResponse> => {
        try {
            const response = await api.get("/api/interviews/random");
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 필터링된 랜덤 질문 조회
    randomlySelectInterviewQuestionByFilters: async (filters: question.RandomlySelectInterviewQuestionByFiltersRequest): Promise<question.RandomlySelectInterviewQuestionByFiltersResponse> => {
        try {
            const response = await api.post("/api/interviews/random/filter", filters);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 질문 등록 (관리자용)
    registerQuestions: async (data: question.RegisterQuestionRequest): Promise<question.RegisterQuestionResponse> => {
        try {
            const response = await api.post("/admin/questions", data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Google Sheets로 질문 일괄 등록 (관리자용)
    registerMultipleQuestions: async (data: question.RegisterMultipleQuestionRequest): Promise<question.RegisterMultipleQuestionResponse> => {
        try {
            const response = await api.post("/admin/questions/sheets", data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 질문 수정 (관리자용)
    editQuestion: async (questionId: number, data: question.EditQuestionRequest): Promise<question.EditQuestionResponse> => {
        try {
            const response = await api.patch(`/admin/questions/${questionId}`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 질문 단건 삭제 (관리자용)
    deleteQuestion: async (questionId: number): Promise<question.DeleteQuestionResponse> => {
        try {
            const response = await api.delete(`/admin/questions/${questionId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 질문 일괄 삭제 (관리자용)
    deleteMultipleQuestions: async (questionIds: number[]): Promise<question.DeleteMultipleQuestionResponse> => {
        try {
            const response = await api.delete("/admin/questions", {
                data: { questionIds }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};