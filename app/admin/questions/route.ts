import { NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/middleware';
import { mockQuestions } from '@/lib/data';

// 임시 질문 저장소 (실제로는 데이터베이스 사용)
const questions = mockQuestions;

// POST /admin/questions - 질문 단건 등록 (어드민만 가능)
async function createQuestion(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { title, content, category, difficulty, field, tags } = body;

    // 필수 필드 검증
    if (!title || !content || !category || !difficulty || !field) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: '필수 필드가 누락되었습니다.'
        },
        { status: 400 }
      );
    }

    // 난이도 검증
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        {
          error: 'INVALID_DIFFICULTY',
          message: '유효하지 않은 난이도입니다.'
        },
        { status: 400 }
      );
    }

    const newQuestion = {
      id: questions.length + 1,
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      difficulty,
      field: field.trim(),
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    questions.push(newQuestion);

    return NextResponse.json(newQuestion, { status: 201 });

  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// GET /admin/questions - 질문 목록 조회 (어드민만 가능)
async function getQuestions(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const field = searchParams.get('field');
    const difficulty = searchParams.get('difficulty');

    let filteredQuestions = [...questions];

    // 필터링
    if (search) {
      const searchLower = search.toLowerCase();
      filteredQuestions = filteredQuestions.filter(q =>
        q.title.toLowerCase().includes(searchLower) ||
        q.content.toLowerCase().includes(searchLower) ||
        q.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (field) {
      filteredQuestions = filteredQuestions.filter(q => q.field === field);
    }

    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }

    // 페이지네이션
    const total = filteredQuestions.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      questions: paginatedQuestions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get questions error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(createQuestion);
export const GET = withAdminAuth(getQuestions);
