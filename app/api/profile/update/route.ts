import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile, verifyAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, profileData } = body;

    // 토큰 검증
    if (!token) {
      return NextResponse.json(
        {
          error: 'NO_TOKEN',
          message: '토큰이 제공되지 않았습니다.'
        },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token) as { userId: number };
    if (!decoded) {
      return NextResponse.json(
        {
          error: 'INVALID_TOKEN',
          message: '유효하지 않은 토큰입니다.'
        },
        { status: 401 }
      );
    }

    // 프로필 데이터 검증
    if (!profileData) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: '프로필 데이터가 제공되지 않았습니다.'
        },
        { status: 400 }
      );
    }

    // 나이 검증
    if (profileData.age && (profileData.age < 18 || profileData.age > 100)) {
      return NextResponse.json(
        {
          error: 'INVALID_AGE',
          message: '나이는 18세 이상 100세 이하여야 합니다.'
        },
        { status: 400 }
      );
    }

    // 필수 필드 검증
    const requiredFields = ['age', 'desiredField', 'desiredCompany', 'experience', 'education'];
    for (const field of requiredFields) {
      if (!profileData[field]) {
        return NextResponse.json(
          {
            error: 'MISSING_REQUIRED_FIELD',
            message: `${field} 필드는 필수입니다.`
          },
          { status: 400 }
        );
      }
    }

    // 온보딩 완료 상태 추가
    const updatedProfileData = {
      ...profileData,
      onboardingCompleted: true
    };

    // 사용자 프로필 업데이트
    const updatedUser = updateUserProfile(decoded.userId, updatedProfileData);

    if (!updatedUser) {
      return NextResponse.json(
        {
          error: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    // 민감한 정보 제외하고 응답
    const { password: _password, ...userResponse } = updatedUser;

    return NextResponse.json(
      {
        message: '프로필이 성공적으로 업데이트되었습니다.',
        user: userResponse
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
