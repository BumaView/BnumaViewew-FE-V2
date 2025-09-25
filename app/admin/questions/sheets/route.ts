import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedRequest } from '@/lib/middleware';

let questions = require('@/lib/data').mockQuestions;

// POST /admin/questions/sheets - 질문 일괄 등록 (어드민만 가능)
async function createQuestionsInBulk(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { questions: questionList } = body;

    if (!questionList || !Array.isArray(questionList) || questionList.length === 0) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: '질문 목록이 필요합니다.'
        },
        { status: 400 }
      );
    }

    const createdQuestions = [];
    const errors = [];

    for (let i = 0; i < questionList.length; i++) {
      const questionData = questionList[i];
      const { title, content, category, difficulty, field, tags } = questionData;

      // 필수 필드 검증
      if (!title || !content || !category || !difficulty || !field) {
        errors.push({
          index: i,
          error: '필수 필드가 누락되었습니다.',
          data: questionData
        });
        continue;
      }

      // 난이도 검증
      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        errors.push({
          index: i,
          error: '유효하지 않은 난이도입니다.',
          data: questionData
        });
        continue;
      }

      const newQuestion = {
        id: questions.length + createdQuestions.length + 1,
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        difficulty,
        field: field.trim(),
        tags: tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      createdQuestions.push(newQuestion);
    }

    // 성공한 질문들을 실제 저장소에 추가
    questions.push(...createdQuestions);

    return NextResponse.json({
      success: createdQuestions.length,
      failed: errors.length,
      createdQuestions,
      errors
    }, { status: 201 });

  } catch (error) {
    console.error('Bulk create questions error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(createQuestionsInBulk);
