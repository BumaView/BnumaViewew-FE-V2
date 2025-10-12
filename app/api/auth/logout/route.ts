import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';

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

    // 토큰 검증
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        {
          error: 'INVALID_TOKEN',
          message: '유효하지 않은 토큰입니다.'
        },
        { status: 401 }
      );
    }

    // 실제 프로덕션에서는 토큰을 블랙리스트에 추가하거나
    // 데이터베이스에서 토큰을 무효화하는 로직이 필요합니다.
    // 현재는 클라이언트에서 토큰을 삭제하도록 안내합니다.

    return NextResponse.json(
      {
        message: '로그아웃이 완료되었습니다.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
