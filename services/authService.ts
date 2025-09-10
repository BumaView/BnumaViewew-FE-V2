//==== Types ====
import { auth } from "@/types";
import { api } from "@/lib/axios";
import { handleApiError } from "@/lib/errorHandler";

//==== Auth Service ====
export const authService = {
    // 현재 사용자 정보 조회
    getCurrentUser: async (): Promise<auth.AuthResponse> => {
        try {
            const response = await api.get("/api/auth/me");
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 로그인
    login: async (data: auth.LoginRequest): Promise<auth.AuthResponse> => {
        try {
            const response = await api.post("/api/auth/login", data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 구글 로그인
    googleLogin: async (data: auth.GoogleLoginRequest): Promise<auth.AuthResponse> => {
        try {
            const response = await api.post("/api/auth/login/google", data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 로그아웃
    logout: async (data: auth.LogoutRequest): Promise<auth.LogoutResponse> => {
        try {
            const response = await api.post("/api/auth/logout", data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
