import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { getUserInterviewSessions, getUserBookmarks } from '@/lib/data';

// GET /api/dashboard - 대시보드 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          error: 'NO_TOKEN',
          message: '토큰이 제공되지 않았습니다.'
        },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token) as any;
    if (!decoded) {
      return NextResponse.json(
        {
          error: 'INVALID_TOKEN',
          message: '유효하지 않은 토큰입니다.'
        },
        { status: 401 }
      );
    }

    const sessions = getUserInterviewSessions(decoded.userId);
    const bookmarks = getUserBookmarks(decoded.userId);

    // 통계 계산
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const averageScore = completedSessions.length > 0 
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length)
      : 0;

    // 이번 주 연습 횟수 계산
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekSessions = sessions.filter(s => 
      new Date(s.startedAt) >= oneWeekAgo
    ).length;

    // 연속 학습일 계산 (임시로 랜덤 값 사용)
    const streakDays = Math.floor(Math.random() * 20) + 5;

    // 최근 활동 (최근 5개)
    const recentActivities = [
      ...completedSessions.slice(-3).map(session => ({
        type: 'interview_completed',
        title: '면접 연습 완료',
        description: `점수: ${session.score}점`,
        timestamp: session.finishedAt || session.startedAt,
        icon: 'check'
      })),
      ...bookmarks.slice(-2).map(bookmark => ({
        type: 'bookmark_added',
        title: '질문 북마크 추가',
        description: '새로운 질문을 북마크했습니다',
        timestamp: bookmark.createdAt,
        icon: 'bookmark'
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

    // 추천 질문 (사용자 분야 기반)
    const recommendations = [
      {
        id: 1,
        title: "알고리즘 문제 해결",
        description: "코딩 테스트 대비 알고리즘 면접 연습",
        difficulty: "중급",
        estimatedTime: "30분"
      },
      {
        id: 2,
        title: "시스템 디자인",
        description: "대규모 시스템 설계 면접 준비",
        difficulty: "고급",
        estimatedTime: "45분"
      },
      {
        id: 3,
        title: "행동 면접",
        description: "STAR 기법을 활용한 경험 기반 면접",
        difficulty: "초급",
        estimatedTime: "20분"
      }
    ];

    const dashboardData = {
      statistics: {
        totalPractices: totalSessions,
        averageScore,
        thisWeekPractices: thisWeekSessions,
        streakDays
      },
      recentActivities,
      recommendations,
      quickActions: [
        {
          id: 'start_interview',
          title: '면접 연습 시작',
          description: '랜덤 질문으로 면접 연습을 시작하세요',
          icon: 'play'
        },
        {
          id: 'view_bookmarks',
          title: '북마크 보기',
          description: '저장한 질문들을 확인하세요',
          icon: 'bookmark'
        },
        {
          id: 'view_history',
          title: '연습 기록',
          description: '지금까지의 면접 연습 기록을 확인하세요',
          icon: 'history'
        }
      ]
    };

    return NextResponse.json(dashboardData, { status: 200 });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
