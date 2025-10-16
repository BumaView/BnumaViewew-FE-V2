//==== Types ====
import { bookmark } from "@/types";
import { api } from "@/lib/axios";
import { handleApiError } from "@/lib/errorHandler";

//==== Bookmark Service ====
export const bookmarkService = {
    // 북마크 폴더 목록 조회
    getBookmarkFolders: async (): Promise<bookmark.GetBookmarkedFolderListResponse> => {
        try {
            console.log('Fetching bookmark folders...');
            const response = await api.get("/user/bookmarks");
            console.log('Bookmark folders response:', response.data);
            console.log('Response type:', typeof response.data);
            console.log('Is array:', Array.isArray(response.data));
            
            // 응답 데이터 검증 및 정규화
            let folders: bookmark.GetBookmarkedFolderListResponse;
            
            if (Array.isArray(response.data)) {
                folders = response.data;
            } else if (response.data && typeof response.data === 'object' && 'content' in response.data) {
                folders = response.data.content;
            } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                folders = response.data.data;
            } else {
                console.warn('Unexpected response structure, returning empty array');
                folders = [];
            }
            
            // 각 폴더의 북마크 배열 검증
            if (Array.isArray(folders)) {
                console.log('Array length:', folders.length);
                folders.forEach((folder, index) => {
                    console.log(`Folder ${index}:`, folder);
                    console.log(`Folder ${index} bookmarks:`, folder.bookmarks);
                    console.log(`Folder ${index} bookmarks type:`, typeof folder.bookmarks);
                    console.log(`Folder ${index} bookmarks is array:`, Array.isArray(folder.bookmarks));
                    
                    // 북마크 배열이 없거나 잘못된 경우 빈 배열로 초기화
                    if (!Array.isArray(folder.bookmarks)) {
                        console.warn(`Folder ${index} bookmarks is not an array, initializing as empty array`);
                        folder.bookmarks = [];
                    }
                });
            }
            
            return folders;
        } catch (error) {
            console.error('Get bookmark folders error:', error);
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
            console.log('Bookmarking question request:', data);
            const response = await api.post("/user/bookmarks", data);
            console.log('Bookmarking question response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Bookmarking question error:', error);
            throw handleApiError(error);
        }
    },

    // 북마크 해제
    unbookmarkingQuestion: async (bookmarkId: number): Promise<void> => {
        try {
            console.log('Unbookmarking question with ID:', bookmarkId);
            await api.delete(`/user/bookmarks?bookmarkId=${bookmarkId}`);
            console.log('Question unbookmarked successfully');
        } catch (error) {
            console.error('Unbookmarking question error:', error);
            throw handleApiError(error);
        }
    },

    // 북마크 폴더 삭제
    deleteBookmarkFolder: async (folderId: number): Promise<void> => {
        try {
            await api.delete(`/user/bookmarks/forders/${folderId}`);
        } catch (error) {
            throw handleApiError(error);
        }
    },
};