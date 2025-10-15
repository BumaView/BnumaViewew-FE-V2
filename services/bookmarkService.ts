//==== Types ====
import { bookmark } from "@/types";
import { api } from "@/lib/axios";
import { handleApiError } from "@/lib/errorHandler";

//==== Bookmark Service ====
export const bookmarkService = {
    // 북마크 폴더 목록 조회
    getBookmarkFolders: async (): Promise<bookmark.GetBookmarkedFolderListResponse> => {
        try {
            const response = await api.get("/user/bookmarks");
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 폴더별 북마크된 질문 조회
    getBookmarkedQuestionsInFolder: async (folderId: number): Promise<bookmark.GetBookmarkedQuestionsInFolderResponse> => {
        try {
            const response = await api.get(`/user/bookmarks/${folderId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 북마크 폴더 생성
    makeBookmarkedFolder: async (data: bookmark.MakeBookmarkedFolderRequest): Promise<bookmark.MakeBookmarkedFolderResponse> => {
        try {
            const response = await api.post("/user/bookmarks/forders", data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 질문 북마크
    bookmarkingQuestion: async (data: bookmark.BookmarkingQuestionRequest): Promise<bookmark.BookmarkingQuestionResponse> => {
        try {
            const response = await api.post("/user/bookmarks", data);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 북마크 해제
    unbookmarkingQuestion: async (bookmarkId: number): Promise<void> => {
        try {
            await api.delete(`/api/bookmarks?bookmarkId=${bookmarkId}`);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // 북마크 폴더 삭제
    deleteBookmarkFolder: async (folderId: number): Promise<void> => {
        try {
            await api.delete(`/api/bookmarks/folders/${folderId}`);
        } catch (error) {
            throw handleApiError(error);
        }
    },
};