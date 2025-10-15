import { NextRequest, NextResponse } from 'next/server';
import * as question from '@/types/question';

export async function POST(request: NextRequest) {
  try {
    const _body: question.RegisterMultipleQuestionRequest = await request.json();
    // const { googleSheetUrl } = body; // 사용하지 않음

    // 임시로 5개의 질문이 등록되었다고 가정
    const totalQuestions = 5;

    const response: question.RegisterMultipleQuestionResponse = {
      message: '구글 시트에서 질문이 성공적으로 등록되었습니다.',
      data: {
        total: totalQuestions
      }
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
