import { NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/middleware';
import { mockQuestions } from '@/lib/data';

const questions = mockQuestions;

// DELETE /admin/questions - 질문 일괄 삭제 (어드민만 가능)
async function deleteQuestionsInBulk(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { questionIds } = body;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: '삭제할 질문 ID 목록이 필요합니다.'
        },
        { status: 400 }
      );
    }

    const deletedQuestions = [];
    const notFoundIds = [];

    for (const questionId of questionIds) {
      const questionIndex = questions.findIndex((q: { id: number }) => q.id === questionId);
      
      if (questionIndex === -1) {
        notFoundIds.push(questionId);
      } else {
        deletedQuestions.push(questions[questionIndex]);
        questions.splice(questionIndex, 1);
      }
    }

    return NextResponse.json({
      message: `${deletedQuestions.length}개의 질문이 삭제되었습니다.`,
      deleted: deletedQuestions.length,
      notFound: notFoundIds.length,
      deletedQuestions,
      notFoundIds
    }, { status: 200 });

  } catch (error) {
    console.error('Bulk delete questions error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

export const DELETE = withAdminAuth(deleteQuestionsInBulk);
