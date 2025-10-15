import { NextRequest, NextResponse } from 'next/server';
import * as session from '@/types/session';
import { mockQuestions } from '@/lib/data';

// 임시 면접 세션 저장소
const mockSessions: session.CreateMockInterviewResponse[] = [];
let nextSessionId = 1;

export async function POST(request: NextRequest) {
  try {
    const body: session.CreateMockInterviewRequest = await request.json();
    const { title, count, category } = body;

    // 필터링된 질문 목록 생성
    let filteredQuestions = mockQuestions;
    
    if (category && category !== '전체') {
      filteredQuestions = mockQuestions.filter(q => q.category === category);
    }

    // 요청된 개수만큼 랜덤 질문 선택 (중복 제거)
    const selectedQuestions = [];
    const usedIndices = new Set<number>();
    
    while (selectedQuestions.length < count && selectedQuestions.length < filteredQuestions.length) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        selectedQuestions.push({
          id: filteredQuestions[randomIndex].id,
          question: filteredQuestions[randomIndex].title
        });
      }
    }

    // 새 세션 생성
    const newSession: session.CreateMockInterviewResponse = {
      id: nextSessionId++,
      title,
      questions: selectedQuestions,
      createdAt: new Date().toISOString()
    };

    mockSessions.push(newSession);
    
    console.log('Created session:', newSession);
    console.log('Selected questions:', selectedQuestions);

    return NextResponse.json(newSession);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
