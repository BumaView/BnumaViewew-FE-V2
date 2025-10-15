import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/types/auth';
import { userDb, tokenUtils } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body: auth.RegisterRequest = await request.json();
    const { id, nickname, email, password, userType } = body;

    // 중복 체크
    const existingUserByUsername = await userDb.findByUsername(id);
    const existingUserByEmail = await userDb.findByEmail(email);
    
    if (existingUserByUsername || existingUserByEmail) {
      return NextResponse.json(
        { message: '이미 존재하는 아이디 또는 이메일입니다.' },
        { status: 400 }
      );
    }

    // 새 사용자 생성
    const newUser = await userDb.create({
      username: id,
      email,
      name: nickname,
      password,
      userType: userType || 'USER'
    });

    // JWT 토큰 생성
    const accessToken = tokenUtils.generateAccessToken({
      id: newUser.id,
      email: newUser.email,
      userType: newUser.userType
    });
    
    const refreshToken = tokenUtils.generateRefreshToken({
      id: newUser.id,
      email: newUser.email
    });

    // 리프레시 토큰을 데이터베이스에 저장
    await userDb.update(newUser.id, { refreshToken });

    const response: auth.RegisterResponse = {
      accessToken,
      refreshToken
    };

    return NextResponse.json(response);
  } catch (_error) {
    console.error('Register error:', _error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
