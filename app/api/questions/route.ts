import { NextRequest, NextResponse } from 'next/server';
import { getAllQuestions, getQuestionsByField, searchQuestions } from '@/lib/data';

// GET /api/questions?query={query}&field={field}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const field = searchParams.get('field');

    let questions;

    if (query) {
      // 검색 쿼리가 있는 경우
      questions = searchQuestions(query);
    } else if (field) {
      // 분야별 필터링
      questions = getQuestionsByField(field);
    } else {
      // 전체 질문 조회
      questions = getAllQuestions();
    }

    return NextResponse.json({
      questions,
      total: questions.length
    }, { status: 200 });

  } catch (error) {
    console.error('Questions API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
