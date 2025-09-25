import { NextRequest, NextResponse } from 'next/server';
import { findUser, verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password, role } = body;

    // 요청 데이터 검증
    if (!id || !password || !role) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: '필수 필드가 누락되었습니다.'
        },
        { status: 400 }
      );
    }

    // 사용자 찾기
    const user = findUser(id);
    if (!user) {
      return NextResponse.json(
        {
          error: 'UNREGISTERED_USER',
          message: '등록되지 않은 사용자입니다.'
        },
        { status: 404 }
      );
    }

    // 비밀번호 확인
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        {
          error: 'INVALID_PASSWORD',
          message: '비밀번호가 일치하지 않습니다.'
        },
        { status: 401 }
      );
    }

    // 역할 확인
    if (user.role !== role) {
      return NextResponse.json(
        {
          error: 'INVALID_ROLE',
          message: '사용자 역할이 일치하지 않습니다.'
        },
        { status: 403 }
      );
    }

    // 토큰 생성
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 응답 생성
    const response = {
      userType: user.role === 'admin' ? 'Admin' : 'User',
      userId: user.id,
      name: user.name,
      accessToken,
      refreshToken,
      onboardingCompleted: user.onboardingCompleted || false
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
