import { NextRequest, NextResponse } from 'next/server';
import * as question from '@/types/question';

// 임시 질문 저장소
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
  }
];

let nextQuestionId = 4;

export async function POST(request: NextRequest) {
  try {
    const body: question.RegisterQuestionRequest = await request.json();
    const { questions } = body;

    const registeredQuestions = questions.map(q => {
      const newQuestion: question.Question = {
        id: nextQuestionId++,
        question: q.q,
        company: '기본회사', // 임시 회사명
        year: 2024,
        category: '기술면접' // 임시 카테고리
      };
      mockQuestions.push(newQuestion);
      return {
        id: newQuestion.id,
        q: newQuestion.question
      };
    });

    const response: question.RegisterQuestionResponse = {
      message: `${questions.length}개의 질문이 등록되었습니다.`,
      registeredQuestions
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body: question.DeleteMultipleQuestionRequest = await request.json();
    const { questionIds } = body;

    // 질문 삭제
    const deletedIds = [];
    for (const id of questionIds) {
      const index = mockQuestions.findIndex(q => q.id === id);
      if (index !== -1) {
        mockQuestions.splice(index, 1);
        deletedIds.push(id);
      }
    }

    const response: question.DeleteMultipleQuestionResponse = {
      ids: deletedIds,
      message: `${deletedIds.length}개의 질문이 삭제되었습니다.`
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
