//==== TanStack Query ====
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//==== Types ====
import { session } from "@/types";

//==== Services ====
import { sessionService } from "@/services/sessionService";

//==== Session Queries ====
export const useSessionQueries = () => {
    const queryClient = useQueryClient();

    // 모의면접 생성 뮤테이션
    const useCreateMockInterview = () => {
        return useMutation({
            mutationFn: sessionService.createMockInterview,
            onSuccess: (data) => {
                queryClient.setQueryData(["sessions", "current"], data);
            },
        });
    };

    // 현재 진행 중인 면접 조회
    const useCurrentSession = () => {
        return useQuery({
            queryKey: ["sessions", "current"],
            queryFn: sessionService.getCurrentSession,
            staleTime: 30 * 1000, // 30초
        });
    };

    // 답변 기록 뮤테이션
    const useRecordAnswer = () => {
        return useMutation({
            mutationFn: ({ interviewId, data }: { interviewId: number; data: session.SessionBySessionQuestionAnswerRecordsRequest }) => 
                sessionService.recordAnswer(interviewId, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["sessions", "current"] });
            },
        });
    };

    // 면접 완료 뮤테이션
    const useFinishInterview = () => {
        return useMutation({
            mutationFn: sessionService.finishInterview,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["sessions"] });
                queryClient.removeQueries({ queryKey: ["sessions", "current"] });
            },
        });
    };

    // 면접 히스토리 조회
    const useInterviewHistory = (page = 0, size = 10) => {
        return useQuery({
            queryKey: ["sessions", "history", { page, size }],
            queryFn: () => sessionService.getInterviewHistory(page, size),
            staleTime: 2 * 60 * 1000, // 2분
        });
    };

    return {
        useCreateMockInterview,
        useCurrentSession,
        useRecordAnswer,
        useFinishInterview,
        useInterviewHistory,
    };
};
