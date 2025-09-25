import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, findUserById } from '@/lib/auth';
import { getAllQuestions, getQuestionsByField } from '@/lib/data';

// GET /user/interviews/random - 랜덤 면접 질문 추천
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          error: 'NO_TOKEN',
          message: '토큰이 제공되지 않았습니다.'
        },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token) as { userId: number };
    if (!decoded) {
      return NextResponse.json(
        {
          error: 'INVALID_TOKEN',
          message: '유효하지 않은 토큰입니다.'
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '5');
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');

    // 사용자 정보 가져오기
    const user = findUserById(decoded.userId);
    let questions = getAllQuestions();

    // 사용자의 희망 분야에 맞는 질문 우선 선택
    if (user?.desiredField) {
      const fieldQuestions = getQuestionsByField(user.desiredField);
      const commonQuestions = questions.filter(q => q.field === '공통');
      questions = [...fieldQuestions, ...commonQuestions];
    }

    // 필터 적용
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }
    if (category) {
      questions = questions.filter(q => q.category === category);
    }

    // 랜덤 선택
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(count, questions.length));

    return NextResponse.json({
      questions: selectedQuestions,
      total: selectedQuestions.length,
      recommendedFor: user?.desiredField || '공통'
    }, { status: 200 });

  } catch (error) {
    console.error('Random questions error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// POST /user/interviews/random/filter - 필터링된 랜덤 면접 질문
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          error: 'NO_TOKEN',
          message: '토큰이 제공되지 않았습니다.'
        },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token) as { userId: number };
    if (!decoded) {
      return NextResponse.json(
        {
          error: 'INVALID_TOKEN',
          message: '유효하지 않은 토큰입니다.'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { count = 5, difficulty, category, field, tags } = body;

    let questions = getAllQuestions();

    // 필터 적용
    if (field) {
      questions = questions.filter(q => q.field === field || q.field === '공통');
    }
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }
    if (category) {
      questions = questions.filter(q => q.category === category);
    }
    if (tags && tags.length > 0) {
      questions = questions.filter(q => 
        tags.some((tag: string) => q.tags.includes(tag))
      );
    }

    // 랜덤 선택
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(count, questions.length));

    return NextResponse.json({
      questions: selectedQuestions,
      total: selectedQuestions.length,
      appliedFilters: { count, difficulty, category, field, tags }
    }, { status: 200 });

  } catch (error) {
    console.error('Filtered random questions error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
