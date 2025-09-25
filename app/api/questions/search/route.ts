import { NextRequest, NextResponse } from 'next/server';
import { searchQuestions } from '@/lib/data';

// POST /api/questions/search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters } = body;

    if (!query) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: '검색어가 필요합니다.'
        },
        { status: 400 }
      );
    }

    let results = searchQuestions(query);

    // 필터 적용
    if (filters) {
      if (filters.field) {
        results = results.filter(q => q.field === filters.field || q.field === '공통');
      }
      if (filters.difficulty) {
        results = results.filter(q => q.difficulty === filters.difficulty);
      }
      if (filters.category) {
        results = results.filter(q => q.category === filters.category);
      }
    }

    return NextResponse.json({
      questions: results,
      total: results.length,
      query
    }, { status: 200 });

  } catch (error) {
    console.error('Question search error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
