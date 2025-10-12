//==== TanStack Query ====
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//==== Types ====
import { question } from "@/types";

//==== Services ====
import { questionService } from "@/services/questionService";

//==== Question Queries ====
export const useQuestionQueries = () => {
    const queryClient = useQueryClient();

    // 전체 질문 목록 조회
    const useQuestions = (page = 0, size = 10) => {
        return useQuery({
            queryKey: ["questions", "list", { page, size }],
            queryFn: () => questionService.searchAllQuestions(page, size),
            staleTime: 2 * 60 * 1000, // 2분
        });
    };

    // 카테고리별 질문 조회
    const useQuestionsByCategory = (params: question.SearchQuestionByCategoryRequest) => {
        return useQuery({
            queryKey: ["questions", "category", params],
            queryFn: () => questionService.searchQuestionByCategory(params),
            staleTime: 2 * 60 * 1000,
        });
    };

    // 질문 상세 조회
    const useQuestion = (id: number) => {
        return useQuery({
            queryKey: ["questions", "detail", id],
            queryFn: () => questionService.searchQuestionById(id),
            enabled: !!id,
            staleTime: 5 * 60 * 1000, // 5분
        });
    };

    // 랜덤 질문 조회
    const useRandomQuestion = (filters?: question.RandomlySelectInterviewQuestionByFiltersRequest) => {
        return useQuery({
            queryKey: ["questions", "random", filters],
            queryFn: () => questionService.randomlySelectInterviewQuestionByFilters(filters),
            staleTime: 30 * 1000, // 30초 - 너무 자주 요청하지 않도록 조정
        });
    };

    // 질문 등록 뮤테이션
    const useCreateQuestion = () => {
        return useMutation({
            mutationFn: questionService.registerSingleQuestion,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["questions"] });
            },
        });
    };

    // 질문 수정 뮤테이션
    const useUpdateQuestion = () => {
        return useMutation({
            mutationFn: questionService.editQuestion,
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ["questions"] });
                queryClient.invalidateQueries({ queryKey: ["questions", "detail", variables.id] });
            },
        });
    };

    // 질문 삭제 뮤테이션
    const useDeleteQuestion = () => {
        return useMutation({
            mutationFn: questionService.deleteMultipleQuestions,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["questions"] });
            },
        });
    };

    return {
        useQuestions,
        useQuestionsByCategory,
        useQuestion,
        useRandomQuestion,
        useCreateQuestion,
        useUpdateQuestion,
        useDeleteQuestion,
    };
};
