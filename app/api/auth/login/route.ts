import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/types/auth';
import { userDb, tokenUtils } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body: auth.LoginRequest = await request.json();
    const { userId, password } = body;

    console.log('Login attempt:', { userId, password });

    // 사용자 찾기 (사용자명 또는 이메일로)
    const user = await userDb.findByUsername(userId) || await userDb.findByEmail(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValidPassword = await userDb.validatePassword(user, password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const accessToken = tokenUtils.generateAccessToken({
      id: user.id,
      email: user.email,
      userType: user.userType
    });
    
    const refreshToken = tokenUtils.generateRefreshToken({
      id: user.id,
      email: user.email
    });

    // 리프레시 토큰을 데이터베이스에 저장
    await userDb.update(user.id, { refreshToken });

    const response: auth.LoginResponse = {
      accessToken,
      refreshToken
    };

    return NextResponse.json(response);
  } catch (_error) {
    console.error('Login error:', _error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
