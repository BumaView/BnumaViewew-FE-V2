import { NextRequest, NextResponse } from 'next/server';
import * as bookmark from '@/types/bookmark';
import { mockQuestions } from '@/lib/data';

// 임시 북마크 폴더 저장소 (bookmarks/route.ts와 동일)
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folder_id: string }> }
) {
  try {
    const { folder_id } = await params;
    const folderId = parseInt(folder_id);
    const folder = mockFolders.find(f => f.folderId === folderId);

    if (!folder) {
      return NextResponse.json(
        { message: '폴더를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const response: bookmark.GetBookmarkedQuestionsInFolderResponse = {
      folderId: folder.folderId,
      name: folder.name,
      bookmarks: folder.bookmarks
    };

    return NextResponse.json(response);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
