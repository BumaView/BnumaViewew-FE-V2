import { NextResponse } from 'next/server';
import * as question from '@/types/question';

// 임시 질문 데이터
const mockQuestions: question.RandomlySelectInterviewQuestionResponse[] = [
  {
    id: 1,
    question: 'React의 주요 특징은 무엇인가요?',
    tag: 'React',
    company: '네이버',
    year: 2024,
    category: '기술면접',
    field: '프론트엔드',
    authorId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    question: 'JavaScript의 클로저란 무엇인가요?',
    tag: 'JavaScript',
    company: '카카오',
    year: 2024,
    category: '기술면접',
    field: '프론트엔드',
    authorId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    question: '자기소개를 해주세요.',
    tag: null,
    company: '구글',
    year: 2024,
    category: '인성면접',
    field: null,
    authorId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    question: 'TypeScript를 사용하는 이유는 무엇인가요?',
    tag: 'TypeScript',
    company: '토스',
    year: 2024,
    category: '기술면접',
    field: '프론트엔드',
    authorId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    question: '팀워크 경험에 대해 말해주세요.',
    tag: null,
    company: '라인',
    year: 2024,
    category: '인성면접',
    field: null,
    authorId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export async function GET() {
  try {
    // 랜덤하게 질문 선택
    const randomIndex = Math.floor(Math.random() * mockQuestions.length);
    const randomQuestion = mockQuestions[randomIndex];

    return NextResponse.json(randomQuestion);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
