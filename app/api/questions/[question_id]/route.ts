import { NextRequest, NextResponse } from 'next/server';
import { getQuestionById } from '@/lib/data';

// GET /api/questions/{question_id}
export async function GET(
  request: NextRequest,
  { params }: { params: { question_id: string } }
) {
  try {
    const questionId = parseInt(params.question_id);

    if (isNaN(questionId)) {
      return NextResponse.json(
        {
          error: 'INVALID_QUESTION_ID',
          message: '유효하지 않은 질문 ID입니다.'
        },
        { status: 400 }
      );
    }

    const question = getQuestionById(questionId);

    if (!question) {
      return NextResponse.json(
        {
          error: 'QUESTION_NOT_FOUND',
          message: '질문을 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(question, { status: 200 });

  } catch (error) {
    console.error('Question detail error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
