import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: auth.LogoutRequest = await request.json();
    const { refreshToken } = body;

    // 실제로는 토큰을 블랙리스트에 추가하거나 무효화
    console.log('Logout request for token:', refreshToken);

    return NextResponse.json({ message: '로그아웃되었습니다.' });
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
