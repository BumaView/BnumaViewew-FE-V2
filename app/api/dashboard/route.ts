import { NextResponse } from 'next/server';
import * as dashboard from '@/types/dashboard';

export async function GET() {
  try {
    // 임시 대시보드 데이터
    const response: dashboard.DashboardResponse = {
      totalQuestions: 150,
      totalBookmarks: 25,
      totalInterviews: 8,
      recentActivity: [
        { title: 'React 면접 완료' },
        { title: 'JavaScript 질문 북마크' },
        { title: 'TypeScript 면접 시작' },
        { title: 'Node.js 질문 북마크' },
        { title: '프론트엔드 면접 완료' }
      ]
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
