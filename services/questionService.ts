//==== Types ====
import { question } from "@/types";
import { api } from "@/lib/axios";
import { handleApiError } from "@/lib/errorHandler";

interface Filters {
    category: string;
    company: string;
    year: string;
    search: string;
}

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

    // 카테고리 검색
    searchCategories: async (filters: Filters): Promise<question.SearchAllQuestionResponse> => {
        try {
            const response = await api.post("/api/questions/search", {
                'category': filters.category ? filters.category : null,
                'company': filters.company ? filters.company : null,
                'year': filters.year ? filters.year : null,
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // TODO: 질문 검색으로 변경
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
            const response = await api.get("/user/interviews/random");
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 필터링된 랜덤 질문 조회
    randomlySelectInterviewQuestionByFilters: async (filters: question.RandomlySelectInterviewQuestionByFiltersRequest): Promise<question.RandomlySelectInterviewQuestionByFiltersResponse> => {
        try {
            const response = await api.post("/user/interviews/random/filter", filters);
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
            // Google Sheets 처리는 시간이 오래 걸릴 수 있으므로 긴 타임아웃 설정
            const response = await api.post("/admin/questions/sheets", data, {
                timeout: 300000 // 5분 타임아웃
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 질문 수정 (관리자용)
    editQuestion: async (question_id: number, data: question.EditQuestionRequest): Promise<question.EditQuestionResponse> => {
        try {
            const response = await api.patch(`/admin/questions/${question_id}`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 질문 단건 삭제 (관리자용)
    deleteQuestion: async (question_id: number): Promise<question.DeleteQuestionResponse> => {
        try {
            const response = await api.delete(`/admin/questions/${question_id}`);
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