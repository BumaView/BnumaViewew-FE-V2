import api from '@/lib/api';
import { DashboardResponse } from '@/types/api';

export const dashboardService = {
  // 대시보드 데이터 조회
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>('/user/dashboard');
    return response.data;
  },
};
