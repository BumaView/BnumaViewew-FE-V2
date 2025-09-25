import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { getInterviewSession, updateInterviewSession } from '@/lib/data';

// POST /user/interviews/{interview_id}/finish - 면접 종료
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

    const resolvedParams = await params;
    const interviewId = parseInt(resolvedParams.interview_id);
    const body = await request.json();
    const { totalTime } = body;

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

    // 이미 완료된 면접인지 확인
    if (session.status === 'completed') {
      return NextResponse.json(session, { status: 200 });
    }

    // 전체 점수 계산
    const totalScore = session.answers.length > 0 
      ? Math.round(session.answers.reduce((sum, answer) => sum + (answer.score || 0), 0) / session.answers.length)
      : 0;

    // 전체 피드백 생성
    const overallFeedback = generateOverallFeedback(session.answers.length, totalScore);

    // 면접 종료 처리
    console.log('Finishing interview with ID:', interviewId);
    console.log('Total time:', totalTime);
    console.log('Total score:', totalScore);
    
    const updatedSession = updateInterviewSession(interviewId, {
      status: 'completed',
      finishedAt: new Date().toISOString(),
      score: totalScore,
      feedback: overallFeedback,
      ...(totalTime && { totalTime })
    });

    console.log('Interview finished, updated session:', updatedSession ? `ID ${updatedSession.id}` : 'null');
    
    if (!updatedSession) {
      return NextResponse.json(
        {
          error: 'UPDATE_FAILED',
          message: '면접 종료 처리에 실패했습니다.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedSession, { status: 200 });

  } catch (error) {
    console.error('Finish interview error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

function generateOverallFeedback(answeredCount: number, averageScore: number): string {
  let feedback = `총 ${answeredCount}개의 질문에 답변해주셨습니다. `;
  
  if (averageScore >= 90) {
    feedback += "매우 우수한 답변이었습니다! 면접 준비가 잘 되어 있으시네요.";
  } else if (averageScore >= 80) {
    feedback += "전반적으로 좋은 답변이었습니다. 조금 더 구체적인 예시를 추가하면 더욱 좋겠습니다.";
  } else if (averageScore >= 70) {
    feedback += "기본적인 내용은 잘 알고 계시나, 더 깊이 있는 설명과 실무 경험을 추가해보세요.";
  } else {
    feedback += "기초적인 부분부터 차근차근 준비해보시기 바랍니다. 꾸준한 연습이 필요합니다.";
  }

  return feedback;
}
