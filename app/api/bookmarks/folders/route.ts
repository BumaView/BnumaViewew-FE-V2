import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { getUserBookmarkFolders, createBookmarkFolder } from '@/lib/data';

// GET /api/bookmark/folders - 북마크 폴더 목록 조회
export async function GET(request: NextRequest) {
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

    const folders = getUserBookmarkFolders(decoded.userId);

    return NextResponse.json({
      folders,
      total: folders.length
    }, { status: 200 });

  } catch (error) {
    console.error('Get bookmark folders error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// POST /api/bookmark/folders - 북마크 폴더 생성
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

    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: '폴더 이름이 필요합니다.'
        },
        { status: 400 }
      );
    }

    const folder = createBookmarkFolder(decoded.userId, name.trim(), description?.trim());

    return NextResponse.json(folder, { status: 201 });

  } catch (error) {
    console.error('Create bookmark folder error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
