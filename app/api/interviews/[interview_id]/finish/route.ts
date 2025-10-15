import { NextRequest, NextResponse } from 'next/server';
import * as session from '@/types/session';
import { mockQuestions } from '@/lib/data';

// 임시 답변 저장소 (이전 파일과 공유)
const mockAnswers: session.SessionBySessionQuestionAnswerRecordsResponse[] = [];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ interview_id: string }> }
) {
  try {
    const { interview_id } = await params;
    const interviewId = parseInt(interview_id);
    const _body: { totalTime: number } = await request.json();
    // const { totalTime } = body; // 사용하지 않음

    // 해당 면접의 모든 답변 조회
    const interviewAnswers = mockAnswers.filter(a => a.interviewId === interviewId);

    // 실제 질문 수 계산 (답변된 질문 수 기준)
    const totalQuestions = interviewAnswers.length > 0 ? interviewAnswers.length : 5;
    const totalTimeSpent = interviewAnswers.reduce((sum, answer) => sum + answer.timeSpent, 0);
    const average = interviewAnswers.length > 0 ? Math.round(totalTimeSpent / interviewAnswers.length) : 0;

    // 질문 목록 생성 (실제로는 저장된 세션에서 가져와야 함)
    const questions = interviewAnswers.length > 0 
      ? interviewAnswers.map(answer => ({
          id: answer.questionId,
          question: `질문 ${answer.questionId}` // 실제로는 질문 내용을 가져와야 함
        }))
      : mockQuestions.slice(0, 5).map(q => ({
          id: q.id,
          question: q.title
        }));

    // 면접 완료 응답 생성
    const response: session.FinishedMockInterviewResponse = {
      interviewId,
      status: 'completed',
      summary: {
        totalQuestions,
        totalTimeSpent,
        average,
        answers: interviewAnswers
      },
      feedback: '면접이 완료되었습니다. 수고하셨습니다!',
      questions,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Finish interview error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
