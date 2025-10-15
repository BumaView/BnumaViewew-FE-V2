import { NextRequest, NextResponse } from 'next/server';
import * as session from '@/types/session';
import { mockQuestions } from '@/lib/data';

// 임시 답변 저장소
const mockAnswers: session.SessionBySessionQuestionAnswerRecordsResponse[] = [];

// 임시 면접 세션 저장소 (실제로는 데이터베이스 사용)
const mockSessions: session.CreateMockInterviewResponse[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ interview_id: string }> }
) {
  try {
    const { interview_id } = await params;
    const interviewId = parseInt(interview_id);
    
    // 저장된 면접 세션 찾기
    let session = mockSessions.find(s => s.id === interviewId);
    
    // 세션이 없으면 동적으로 생성 (임시 처리)
    if (!session) {
      // 랜덤하게 5개 질문 선택 (중복 제거)
      const selectedQuestions = [];
      const usedIndices = new Set<number>();
      
      while (selectedQuestions.length < 5 && selectedQuestions.length < mockQuestions.length) {
        const randomIndex = Math.floor(Math.random() * mockQuestions.length);
        
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          selectedQuestions.push({
            id: mockQuestions[randomIndex].id,
            question: mockQuestions[randomIndex].title
          });
        }
      }
      
      session = {
        id: interviewId,
        title: '랜덤 면접',
        questions: selectedQuestions,
        createdAt: new Date().toISOString()
      };
      
      // 세션을 저장소에 추가
      mockSessions.push(session);
      
      console.log('Created dynamic session:', session);
      console.log('Selected questions:', selectedQuestions);
    }

    // 해당 세션의 답변들 찾기
    const answers = mockAnswers.filter(a => a.interviewId === interviewId);
    
    // 면접 완료 여부 확인
    const isCompleted = answers.length >= session.questions.length;
    
    const response: session.FinishedMockInterviewResponse = {
      interviewId: session.id,
      status: isCompleted ? 'completed' : 'in_progress',
      summary: {
        totalQuestions: session.questions.length,
        totalTimeSpent: answers.reduce((total, answer) => total + answer.timeSpent, 0),
        average: answers.length > 0 ? answers.reduce((total, answer) => total + answer.timeSpent, 0) / answers.length : 0,
        answers: answers
      },
      feedback: isCompleted ? '면접이 완료되었습니다.' : '면접이 진행 중입니다.',
      questions: session.questions,
      createdAt: session.createdAt
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ interview_id: string }> }
) {
  try {
    const { interview_id } = await params;
    const interviewId = parseInt(interview_id);
    const body: session.SessionBySessionQuestionAnswerRecordsRequest = await request.json();
    const { questionId, answer, timeSpent } = body;

    // 답변 저장
    const newAnswer: session.SessionBySessionQuestionAnswerRecordsResponse = {
      interviewId,
      questionId,
      answer,
      timeSpent,
      recordedAt: new Date().toISOString()
    };

    mockAnswers.push(newAnswer);

    return NextResponse.json(newAnswer);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
