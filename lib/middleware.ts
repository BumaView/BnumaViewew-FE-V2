import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, findUserById } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: number;
    username: string;
    role: 'user' | 'admin';
  };
}

// 인증 미들웨어
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authHeader = req.headers.get('authorization');
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

    const decoded = verifyAccessToken(token) as any;
    if (!decoded) {
      return NextResponse.json(
        {
          error: 'INVALID_TOKEN',
          message: '유효하지 않은 토큰입니다.'
        },
        { status: 401 }
      );
    }

    const user = findUserById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        {
          error: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    // 요청에 사용자 정보 추가
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    return handler(authenticatedReq);
  };
}

// 어드민 권한 검증 미들웨어
export function withAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
    if (req.user?.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'FORBIDDEN',
          message: '관리자 권한이 필요합니다.'
        },
        { status: 403 }
      );
    }

    return handler(req);
  });
}
