import { NextRequest, NextResponse } from 'next/server';
import * as question from '@/types/question';

// 임시 질문 저장소 (admin/questions/route.ts와 동일)
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ question_id: string }> }
) {
  try {
    const { question_id } = await params;
    const questionId = parseInt(question_id);
    const body: question.EditQuestionRequest = await request.json();
    const { q } = body;

    const questionIndex = mockQuestions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      return NextResponse.json(
        { message: '질문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 질문 수정
    mockQuestions[questionIndex].question = q;

    const response: question.EditQuestionResponse = {
      id: questionId,
      message: '질문이 수정되었습니다.'
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ question_id: string }> }
) {
  try {
    const { question_id } = await params;
    const questionId = parseInt(question_id);

    const questionIndex = mockQuestions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      return NextResponse.json(
        { message: '질문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 질문 삭제
    mockQuestions.splice(questionIndex, 1);

    const response: question.DeleteQuestionResponse = {
      id: questionId,
      message: '질문이 삭제되었습니다.'
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
