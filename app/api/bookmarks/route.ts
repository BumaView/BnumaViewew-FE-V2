import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { getUserBookmarks, addBookmark, removeBookmark, getQuestionById } from '@/lib/data';

// GET /api/bookmarks - 사용자의 북마크 목록 조회
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

    const bookmarks = getUserBookmarks(decoded.userId);
    
    // 북마크에 질문 정보 포함
    const bookmarksWithQuestions = bookmarks.map(bookmark => ({
      ...bookmark,
      question: getQuestionById(bookmark.questionId)
    }));

    return NextResponse.json({
      bookmarks: bookmarksWithQuestions,
      total: bookmarks.length
    }, { status: 200 });

  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// POST /api/bookmarks - 북마크 추가
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

    const body = await request.json();
    const { questionId, folderId } = body;

    if (!questionId) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: '질문 ID가 필요합니다.'
        },
        { status: 400 }
      );
    }

    // 질문이 존재하는지 확인
    const question = getQuestionById(questionId);
    if (!question) {
      return NextResponse.json(
        {
          error: 'QUESTION_NOT_FOUND',
          message: '질문을 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    // 이미 북마크되어 있는지 확인
    const existingBookmarks = getUserBookmarks(decoded.userId);
    const alreadyBookmarked = existingBookmarks.some(b => b.questionId === questionId);

    if (alreadyBookmarked) {
      return NextResponse.json(
        {
          error: 'ALREADY_BOOKMARKED',
          message: '이미 북마크된 질문입니다.'
        },
        { status: 409 }
      );
    }

    const bookmark = addBookmark(decoded.userId, questionId, folderId);

    return NextResponse.json({
      ...bookmark,
      question
    }, { status: 201 });

  } catch (error) {
    console.error('Add bookmark error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/bookmarks - 북마크 제거
export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { questionId } = body;

    if (!questionId) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: '질문 ID가 필요합니다.'
        },
        { status: 400 }
      );
    }

    // 북마크가 존재하는지 확인
    const existingBookmarks = getUserBookmarks(decoded.userId);
    const bookmarkExists = existingBookmarks.some(b => b.questionId === questionId);

    if (!bookmarkExists) {
      return NextResponse.json(
        {
          error: 'BOOKMARK_NOT_FOUND',
          message: '북마크를 찾을 수 없습니다.'
        },
        { status: 404 }
      );
    }

    const success = removeBookmark(decoded.userId, questionId);

    if (success) {
      return NextResponse.json({
        message: '북마크가 제거되었습니다.'
      }, { status: 200 });
    } else {
      return NextResponse.json(
        {
          error: 'REMOVE_FAILED',
          message: '북마크 제거에 실패했습니다.'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Remove bookmark error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}
