import { NextRequest, NextResponse } from 'next/server';
import { userDb, tokenUtils } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // JWT 토큰 검증
    let decoded;
    try {
      decoded = tokenUtils.verifyAccessToken(token);
    } catch (error) {
      return NextResponse.json(
        { message: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // 사용자 정보 조회
    const user = await userDb.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 정보 반환 (비밀번호 제외)
    const userInfo = {
      id: user.id,
      userId: user.username,
      nickname: user.name || user.username,
      email: user.email,
      userType: user.userType,
      onboardingCompleted: user.onboardingCompleted
    };

    return NextResponse.json(userInfo);
  } catch (_error) {
    console.error('Token verify error:', _error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
