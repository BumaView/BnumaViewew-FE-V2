//==== TanStack Query ====
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//==== Types ====
import { auth } from "@/types";

//==== Services ====
import { authService } from "@/services/authService";

//==== Auth Queries ====
export const useAuthQueries = () => {
    const queryClient = useQueryClient();

    // 현재 사용자 정보 조회
    const useCurrentUser = () => {
        return useQuery({
            queryKey: ["auth", "currentUser"],
            queryFn: authService.getCurrentUser,
            retry: false,
            staleTime: 5 * 60 * 1000, // 5분
        });
    };

    // 로그인 뮤테이션
    const useLogin = () => {
        return useMutation({
            mutationFn: authService.login,
            onSuccess: (data) => {
                queryClient.setQueryData(["auth", "currentUser"], data);
            },
        });
    };

    // 구글 로그인 뮤테이션
    const useGoogleLogin = () => {
        return useMutation({
            mutationFn: authService.googleLogin,
            onSuccess: (data) => {
                queryClient.setQueryData(["auth", "currentUser"], data);
            },
        });
    };

    // 로그아웃 뮤테이션
    const useLogout = () => {
        return useMutation({
            mutationFn: authService.logout,
            onSuccess: () => {
                queryClient.clear();
            },
        });
    };

    return {
        useCurrentUser,
        useLogin,
        useGoogleLogin,
        useLogout,
    };
};
