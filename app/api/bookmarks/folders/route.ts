import { NextRequest, NextResponse } from 'next/server';
import * as bookmark from '@/types/bookmark';

// 임시 북마크 폴더 저장소
const mockFolders: bookmark.MakeBookmarkedFolderResponse[] = [];
let nextFolderId = 1;

export async function POST(request: NextRequest) {
  try {
    const body: bookmark.MakeBookmarkedFolderRequest = await request.json();
    const { name } = body;

    // 새 폴더 생성
    const newFolder: bookmark.MakeBookmarkedFolderResponse = {
      folderId: nextFolderId++,
      name
    };

    mockFolders.push(newFolder);

    return NextResponse.json(newFolder);
  } catch (_error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
