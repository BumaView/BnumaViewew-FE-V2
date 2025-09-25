import { NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/middleware';
import { mockQuestions } from '@/lib/data';

const questions = mockQuestions;

// PATCH /admin/questions/{question_id} - 질문 수정 (어드민만 가능)
async function updateQuestion(
  req: AuthenticatedRequest,
  context?: { params: Promise<{ question_id: string }> }
): Promise<NextResponse> {
  try {
    if (!context?.params) {
      return NextResponse.json(
        { error: 'MISSING_PARAMS', message: 'Parameters not provided' },
        { status: 400 }
      );
    }
    const resolvedParams = await context.params;
    const questionId = parseInt(resolvedParams.question_id);

    if (isNaN(questionId)) {
      return NextResponse.json(
        {
          error: 'INVALID_QUESTION_ID',
          message: '유효하지 않은 질문 ID입니다.'
        },
        { status: 400 }
      );
    }

    const questionIndex = questions.findIndex((q: { id: number }) => q.id === questionId);

    if (questionIndex === -1) {
      return NextResponse.json(
        {
          error: 'QUESTION_NOT_FOUND',
          message: '질문을 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, content, category, difficulty, field, tags } = body;

    // 업데이트할 필드만 적용
    const updatedQuestion = { ...questions[questionIndex] };

    if (title !== undefined) updatedQuestion.title = title.trim();
    if (content !== undefined) updatedQuestion.content = content.trim();
    if (category !== undefined) updatedQuestion.category = category.trim();
    if (difficulty !== undefined) {
      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        return NextResponse.json(
          {
            error: 'INVALID_DIFFICULTY',
            message: '유효하지 않은 난이도입니다.'
          },
          { status: 400 }
        );
      }
      updatedQuestion.difficulty = difficulty;
    }
    if (field !== undefined) updatedQuestion.field = field.trim();
    if (tags !== undefined) updatedQuestion.tags = tags;

    updatedQuestion.updatedAt = new Date().toISOString();

    questions[questionIndex] = updatedQuestion;

    return NextResponse.json(updatedQuestion, { status: 200 });

  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// DELETE /admin/questions/{question_id} - 질문 단건 삭제 (어드민만 가능)
async function deleteQuestion(
  req: AuthenticatedRequest,
  context?: { params: Promise<{ question_id: string }> }
): Promise<NextResponse> {
  try {
    if (!context?.params) {
      return NextResponse.json(
        { error: 'MISSING_PARAMS', message: 'Parameters not provided' },
        { status: 400 }
      );
    }
    const resolvedParams = await context.params;
    const questionId = parseInt(resolvedParams.question_id);

    if (isNaN(questionId)) {
      return NextResponse.json(
        {
          error: 'INVALID_QUESTION_ID',
          message: '유효하지 않은 질문 ID입니다.'
        },
        { status: 400 }
      );
    }

    const questionIndex = questions.findIndex((q: { id: number }) => q.id === questionId);

    if (questionIndex === -1) {
      return NextResponse.json(
        {
          error: 'QUESTION_NOT_FOUND',
          message: '질문을 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    const deletedQuestion = questions[questionIndex];
    questions.splice(questionIndex, 1);

    return NextResponse.json({
      message: '질문이 성공적으로 삭제되었습니다.',
      deletedQuestion
    }, { status: 200 });

  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

export const PATCH = withAdminAuth(updateQuestion);
export const DELETE = withAdminAuth(deleteQuestion);
