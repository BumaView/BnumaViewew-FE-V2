import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { getInterviewSession, updateInterviewSession } from '@/lib/data';

// GET /user/interviews/{interview_id} - 특정 면접 세션 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ interview_id: string }> }
) {
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

    const resolvedParams = await params;
    const interviewId = parseInt(resolvedParams.interview_id);

    if (isNaN(interviewId)) {
      return NextResponse.json(
        {
          error: 'INVALID_INTERVIEW_ID',
          message: '유효하지 않은 면접 ID입니다.'
        },
        { status: 400 }
      );
    }

    console.log('GET: Looking for session with ID:', interviewId);
    const session = getInterviewSession(interviewId);
    console.log('GET: Found session:', session ? `ID ${session.id}` : 'null');

    if (!session) {
      console.log('GET: Session not found, returning 404');
      return NextResponse.json(
        {
          error: 'INTERVIEW_NOT_FOUND',
          message: '면접 세션을 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    // 본인의 면접 세션인지 확인
    if (session.userId !== decoded.userId) {
      return NextResponse.json(
        {
          error: 'FORBIDDEN',
          message: '접근 권한이 없습니다.'
        },
        { status: 403 }
      );
    }

    return NextResponse.json(session, { status: 200 });

  } catch (error) {
    console.error('Get interview session error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// POST /user/interviews/{interview_id} - 면접 세션에 답변 제출/업데이트
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ interview_id: string }> }
) {
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

    const resolvedParams = await params;
    const interviewId = parseInt(resolvedParams.interview_id);
    const body = await request.json();
    const { questionId, answer, timeSpent, totalTime } = body;

    if (isNaN(interviewId)) {
      return NextResponse.json(
        {
          error: 'INVALID_INTERVIEW_ID',
          message: '유효하지 않은 면접 ID입니다.'
        },
        { status: 400 }
      );
    }

    const session = getInterviewSession(interviewId);

    if (!session) {
      return NextResponse.json(
        {
          error: 'INTERVIEW_NOT_FOUND',
          message: '면접 세션을 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    // 본인의 면접 세션인지 확인
    if (session.userId !== decoded.userId) {
      return NextResponse.json(
        {
          error: 'FORBIDDEN',
          message: '접근 권한이 없습니다.'
        },
        { status: 403 }
      );
    }

    // 답변 추가/업데이트
    const existingAnswerIndex = session.answers.findIndex(a => a.questionId === questionId);
    const newAnswer = {
      questionId,
      answer,
      timeSpent,
      score: Math.floor(Math.random() * 30) + 70, // 임시 점수 (70-100)
      feedback: "좋은 답변입니다. 더 구체적인 예시를 추가하면 더 좋겠습니다."
    };

    if (existingAnswerIndex >= 0) {
      session.answers[existingAnswerIndex] = newAnswer;
    } else {
      session.answers.push(newAnswer);
    }

    // 세션 업데이트 (질문별 시간과 총 시간 저장)
    const questionTimes = session.questionTimes || {};
    questionTimes[questionId] = timeSpent;
    
    const updatedSession = updateInterviewSession(interviewId, {
      answers: session.answers,
      questionTimes,
      ...(totalTime && { totalTime })
    });

    return NextResponse.json(updatedSession, { status: 200 });

  } catch (error) {
    console.error('Submit answer error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
