import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { createInterviewSession, getUserInterviewSessions } from '@/lib/data';

// GET /user/interviews - 사용자의 면접 세션 목록 조회
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

    const decoded = verifyAccessToken(token) as { userId: number };
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

    return NextResponse.json({
      interviews: sessions,
      total: sessions.length
    }, { status: 200 });

  } catch (error) {
    console.error('Get interviews error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// POST /user/interviews - 새 면접 세션 생성
export async function POST(request: NextRequest) {
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

    const decoded = verifyAccessToken(token) as { userId: number };
    if (!decoded) {
      return NextResponse.json(
        {
          error: 'INVALID_TOKEN',
          message: '유효하지 않은 토큰입니다.'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { questionIds } = body;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: '질문 ID 목록이 필요합니다.'
        },
        { status: 400 }
      );
    }

    const session = createInterviewSession(decoded.userId, questionIds);

    return NextResponse.json(session, { status: 201 });

  } catch (error) {
    console.error('Create interview error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
