// ===== Dashboard 관련 타입 =====
export type DashboardResponse = {
    totalQuestions: number;
    totalBookmarks: number;
    totalInterviews: number;
    recentActivity: {
        title: string;
    }[];
};
