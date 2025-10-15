import { NextRequest, NextResponse } from 'next/server';
import * as bookmark from '@/types/bookmark';
import { mockQuestions } from '@/lib/data';

// 임시 북마크 폴더 저장소
const mockFolders: bookmark.GetBookmarkedFolderListResponse = [
  {
    folderId: 1,
    name: '기술면접 질문',
    bookmarks: [
      {
        bookmarkId: 1,
        questionId: 1,
        question: mockQuestions.find(q => q.id === 1)?.title || 'React의 생명주기에 대해 설명해주세요'
      },
      {
        bookmarkId: 2,
        questionId: 2,
        question: mockQuestions.find(q => q.id === 2)?.title || '데이터베이스 정규화에 대해 설명해주세요'
      }
    ]
  },
  {
    folderId: 2,
    name: '인성면접 질문',
    bookmarks: [
      {
        bookmarkId: 3,
        questionId: 3,
        question: mockQuestions.find(q => q.id === 3)?.title || '자신의 장점과 단점을 말씀해주세요'
      }
    ]
  }
];

let nextBookmarkId = 4;

export async function GET() {
  try {
    return NextResponse.json(mockFolders);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: bookmark.BookmarkingQuestionRequest = await request.json();
    const { questionId, folderId } = body;

    // 폴더 찾기
    const folder = mockFolders.find(f => f.folderId === folderId);
    if (!folder) {
      return NextResponse.json(
        { message: '폴더를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 북마크되어 있는지 확인
    const existingBookmark = folder.bookmarks.find(b => b.questionId === questionId);
    if (existingBookmark) {
      return NextResponse.json(
        { message: '이미 북마크된 질문입니다.' },
        { status: 400 }
      );
    }

    // 실제 질문 데이터에서 질문 내용 가져오기
    const question = mockQuestions.find(q => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { message: '질문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 새 북마크 추가
    const newBookmark: bookmark.BookmarkingQuestionResponse = {
      bookmarkId: nextBookmarkId++,
      questionId,
      folderId
    };

    folder.bookmarks.push({
      bookmarkId: newBookmark.bookmarkId,
      questionId: newBookmark.questionId,
      question: question.title // 실제 질문 제목 사용
    });

    return NextResponse.json(newBookmark);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookmarkId = parseInt(searchParams.get('bookmarkId') || '0');

    // 모든 폴더에서 해당 북마크 찾아서 삭제
    for (const folder of mockFolders) {
      const bookmarkIndex = folder.bookmarks.findIndex(b => b.bookmarkId === bookmarkId);
      if (bookmarkIndex !== -1) {
        folder.bookmarks.splice(bookmarkIndex, 1);
        return NextResponse.json({ message: '북마크가 삭제되었습니다.' });
      }
    }

    return NextResponse.json(
      { message: '북마크를 찾을 수 없습니다.' },
      { status: 404 }
    );
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
