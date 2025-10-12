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
    searchQuestions: async (query: string): Promise<question.SearchAllQuestionResponse> => {
        try {
            const response = await api.get("/api/questions", {
                params: { query }
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 카테고리별 질문 조회
    searchQuestionByCategory: async (params: question.SearchQuestionByCategoryRequest): Promise<question.SearchQuestionByCategoryResponse> => {
        try {
            const response = await api.post("/api/questions/search", params);
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
    randomlySelectInterviewQuestionByFilters: async (filters?: question.RandomlySelectInterviewQuestionByFiltersRequest): Promise<question.RandomlySelectInterviewQuestionByFiltersResponse> => {
        try {
            const response = await api.post("/user/interviews/random/filter", filters);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 질문 등록 (관리자용)
    registerSingleQuestion: async (data: question.RegisterSingleQuestionRequest): Promise<question.RegisterSingleQuestionResponse> => {
        try {
            const response = await api.post("/admin/questions", data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 구글 시트로 질문 등록 (관리자용)
    registerMultipleQuestions: async (data: question.RegisterMultipleQuestionRequest): Promise<question.RegisterMultipleQuestionResponse> => {
        try {
            const response = await api.post("/admin/questions/sheets", data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 질문 수정 (관리자용)
    editQuestion: async (data: question.EditQuestionRequest): Promise<question.EditQuestionResponse> => {
        try {
            const response = await api.put(`/admin/questions/${data.id}`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 질문 삭제 (관리자용)
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