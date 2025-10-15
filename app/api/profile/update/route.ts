import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, userType } = body;

    // 임시로 성공 응답 반환
    const response = {
      success: true,
      message: '프로필이 업데이트되었습니다.',
      data: {
        nickname,
        userType
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
