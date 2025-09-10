// ===== Bookmark 관련 타입 =====
export type MakeBookmarkedFolderRequest = {
    name: string;
};

export type MakeBookmarkedFolderResponse = {
    folderId: number;
    name: string;
    createdAt: string;
};

export type BookmarkingQuestionRequest = {
    questionId: number;
    folderId: number;
};

export type BookmarkingQuestionResponse = {
    bookmarkId: number;
    questionId: number;
    folderId: number;
    createdAt: string;
};

export type GetBookmarkedFolderListResponse = {
    folders: [
        {
            folderId: number;
            name: string;
            bookmarkCount: number;
        }
    ]
};

export type GetBookmarkedQuestionsInFolderResponse = {
    folderId: number;
    name: string;
    bookmarks: [
        {
            bookmarkId: number;
            questionId: number;
            title: string;
        }
    ]
};
