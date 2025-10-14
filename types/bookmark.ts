// ===== Bookmark 관련 타입 =====
export type MakeBookmarkedFolderRequest = {
    name: string;
};

export type MakeBookmarkedFolderResponse = {
    folderId: number;
    name: string;
};

export type BookmarkingQuestionRequest = {
    questionId: number;
    folderId: number;
};

export type BookmarkingQuestionResponse = {
    bookmarkId: number;
    questionId: number;
    folderId: number;
};

export type GetBookmarkedFolderListResponse = {
    folderId: number;
    name: string;
    bookmarks: {
        bookmarkId: number;
        questionId: number;
        question: string;
    }[];
}[];

export type GetBookmarkedQuestionsInFolderResponse = {
    folderId: number;
    name: string;
    bookmarks: {
        bookmarkId: number;
        questionId: number;
        question: string;
    }[];
};
