import { NextRequest, NextResponse } from 'next/server';
import * as question from '@/types/question';

// 임시 질문 데이터
const mockQuestions: question.Question[] = [
  {
    id: 1,
    question: 'React의 주요 특징은 무엇인가요?',
    company: '네이버',
    year: 2024,
    category: '기술면접'
  },
  {
    id: 2,
    question: 'JavaScript의 클로저란 무엇인가요?',
    company: '카카오',
    year: 2024,
    category: '기술면접'
  },
  {
    id: 3,
    question: '자기소개를 해주세요.',
    company: '구글',
    year: 2024,
    category: '인성면접'
  },
  {
    id: 4,
    question: 'TypeScript를 사용하는 이유는 무엇인가요?',
    company: '토스',
    year: 2024,
    category: '기술면접'
  },
  {
    id: 5,
    question: '팀워크 경험에 대해 말해주세요.',
    company: '라인',
    year: 2024,
    category: '인성면접'
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ question_id: string }> }
) {
  try {
    const { question_id } = await params;
    const questionId = parseInt(question_id);
    const foundQuestion = mockQuestions.find(q => q.id === questionId);

    if (!foundQuestion) {
      return NextResponse.json(
        { message: '질문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(foundQuestion);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
