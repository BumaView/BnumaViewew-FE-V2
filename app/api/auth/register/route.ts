import { NextRequest, NextResponse } from 'next/server';
import { userExists, createUser, generateAccessToken, generateRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password, name, role = 'user' } = body;

    // 요청 데이터 검증
    if (!id || !password || !name) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: '필수 필드가 누락되었습니다.'
        },
        { status: 400 }
      );
    }

    // 사용자명 길이 검증
    if (id.length < 3 || id.length > 20) {
      return NextResponse.json(
        {
          error: 'INVALID_USERNAME',
          message: '사용자명은 3-20자 사이여야 합니다.'
        },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        {
          error: 'INVALID_PASSWORD',
          message: '비밀번호는 최소 6자 이상이어야 합니다.'
        },
        { status: 400 }
      );
    }

    // 중복 사용자 확인
    if (userExists(id)) {
      return NextResponse.json(
        {
          error: 'USER_EXISTS',
          message: '이미 존재하는 사용자입니다.'
        },
        { status: 409 }
      );
    }

    // 역할 검증
    if (role !== 'user' && role !== 'admin') {
      return NextResponse.json(
        {
          error: 'INVALID_ROLE',
          message: '올바르지 않은 사용자 역할입니다.'
        },
        { status: 400 }
      );
    }

    // 사용자 생성
    const newUser = createUser(id, password, name, role);

    // 토큰 생성
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // 응답 생성
    const response = {
      userType: newUser.role === 'admin' ? 'Admin' : 'User',
      userId: newUser.id,
      name: newUser.name,
      accessToken,
      refreshToken
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
