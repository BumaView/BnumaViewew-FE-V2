import { api } from "@/lib/axios";
import { handleApiError } from "@/lib/errorHandler";
import * as dashboard from "@/types/dashboard";

//==== Dashboard Service ====
export const dashboardService = {
    // 대시보드 데이터 조회
    getDashboard: async (): Promise<dashboard.DashboardResponse> => {
        try {
            const response = await api.get("/api/dashboard");
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};
