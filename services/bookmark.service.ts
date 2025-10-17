import api from '@/lib/api';
import {
  CreateBookmarkFolderRequest,
  CreateBookmarkFolderResponse,
  BookmarkQuestionRequest,
  BookmarkQuestionResponse,
  BookmarkListResponse,
  BookmarkFolder,
} from '@/types/api';

export const bookmarkService = {
  // 질문 폴더 생성
  createFolder: async (data: CreateBookmarkFolderRequest): Promise<CreateBookmarkFolderResponse> => {
    const response = await api.post<CreateBookmarkFolderResponse>('/user/bookmarks/forders', data);
    return response.data;
  },

  // 질문 북마크
  bookmarkQuestion: async (data: BookmarkQuestionRequest): Promise<BookmarkQuestionResponse> => {
    const response = await api.post<BookmarkQuestionResponse>('/user/bookmarks', data);
    return response.data;
  },

  // 질문 북마크 목록 조회
  getBookmarkList: async (): Promise<BookmarkListResponse> => {
    const response = await api.get<BookmarkListResponse>('/user/bookmarks');
    return response.data;
  },

  // 질문 폴더 목록 조회
  getFolderContents: async (folderId: number): Promise<BookmarkFolder> => {
    const response = await api.get<BookmarkFolder>(`/user/bookmarks/${folderId}`);
    return response.data;
  },

  // 북마크 해제
  unbookmarkQuestion: async (bookmarkId: number): Promise<void> => {
    await api.delete(`/user/bookmarks?bookmarkId=${bookmarkId}`);
  },

  // 폴더 삭제
  deleteFolder: async (folderId: number): Promise<void> => {
    await api.delete(`/user/bookmarks/forders/${folderId}`);
  },
};
