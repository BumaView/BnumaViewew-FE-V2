//==== TanStack Query ====
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//==== Types ====
import { bookmark } from "@/types";

//==== Services ====
import { bookmarkService } from "@/services/bookmarkService";

//==== Bookmark Queries ====
export const useBookmarkQueries = () => {
    const queryClient = useQueryClient();

    // 북마크 폴더 목록 조회
    const useBookmarkFolders = () => {
        return useQuery({
            queryKey: ["bookmarks", "folders"],
            queryFn: bookmarkService.getBookmarkFolders,
            staleTime: 5 * 60 * 1000, // 5분
        });
    };

    // 폴더별 북마크된 질문 조회
    const useBookmarksInFolder = (folderId: number) => {
        return useQuery({
            queryKey: ["bookmarks", "folder", folderId],
            queryFn: () => bookmarkService.getBookmarkedQuestionsInFolder(folderId),
            enabled: !!folderId,
            staleTime: 2 * 60 * 1000, // 2분
        });
    };

    // 북마크 폴더 생성 뮤테이션
    const useCreateBookmarkFolder = () => {
        return useMutation({
            mutationFn: bookmarkService.makeBookmarkedFolder,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["bookmarks", "folders"] });
            },
        });
    };

    // 질문 북마크 뮤테이션
    const useBookmarkQuestion = () => {
        return useMutation({
            mutationFn: bookmarkService.bookmarkingQuestion,
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ["bookmarks", "folder", variables.folderId] });
                queryClient.invalidateQueries({ queryKey: ["bookmarks", "folders"] });
            },
        });
    };

    // 북마크 해제 뮤테이션
    const useUnbookmarkQuestion = () => {
        return useMutation({
            mutationFn: bookmarkService.unbookmarkingQuestion,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
            },
        });
    };

    return {
        useBookmarkFolders,
        useBookmarksInFolder,
        useCreateBookmarkFolder,
        useBookmarkQuestion,
        useUnbookmarkQuestion,
    };
};
