// ===== 공통 타입 =====
export type Pageable = {
    pageNumber: number;
    pageSize: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
};

export type Sort = {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
};

export type Question = {
    id: number;
    question: string;
    company: string;
    year: number;
    category: string;
};

export type QuestionDetail = {
    id: number;
    tags: string[];
    question: string;
    company: string;
    year: number;
    category: string;
    createdAt: string;
    updatedAt: string;
};

export type PaginatedResponse<T> = {
    content: T[]; // 백엔드 응답 구조에 맞게 content 사용
    questions?: T[]; // 하위 호환성을 위해 questions도 유지
    pageable: Pageable;
    last: boolean;
    totalPages: number;
    totalElements: number;
    first: boolean;
    size: number;
    number: number;
    sort: Sort;
    numberOfElements: number;
    empty: boolean;
};

// ===== Question CRUD 관련 타입 =====
export type RegisterQuestionRequest = {
    questions: {q: string}[]
};

export type RegisterQuestionResponse = {
    message: string;
    registeredQuestions: {
        id: number;
        q: string;
    }[];
};

export type RegisterMultipleQuestionRequest = {
    googleSheetUrl: string;
};

export type RegisterMultipleQuestionResponse = {
    message: string;
    data: {
        total: number;
    };
};

export type EditQuestionRequest = {
    q: string;
};

export type EditQuestionResponse = {
    id: number;
    message: string;
};

export type DeleteQuestionResponse = {
    id: number;
    message: string;
};

export type DeleteMultipleQuestionRequest = {
    questionIds: number[];
};

export type DeleteMultipleQuestionResponse = {
    ids: number[];
    message: string;
};

// ===== Question 검색 관련 타입 =====
export type SearchAllQuestionResponse = PaginatedResponse<Question>;

export type SearchQuestionByCategoryRequest = {
    company: string;
    year: number;
    category: string;
};

export type SearchQuestionByCategoryResponse = PaginatedResponse<Question>;

export type SearchQuestionListResponse = PaginatedResponse<Question>;

export type SearchQuestionByIdResponse = Question;

// ===== Question 랜덤 선택 관련 타입 =====
export type RandomlySelectInterviewQuestionResponse = {
    id: number;
    question: string;
    tag: string | null;
    company: string;
    year: number;
    category: string;
    field: string | null;
    authorId: string;
    createdAt: string;
    updatedAt: string;
};

export type RandomlySelectInterviewQuestionByFiltersRequest = {
    category: string;
    company: string;
    year: number;
};

export type RandomlySelectInterviewQuestionByFiltersResponse = {
    id: number;
    question: string;
    tag: string | null;
    company: string;
    year: number;
    category: string;
    field: string | null;
    authorId: string;
    createdAt: string;
    updatedAt: string;
};

// ===== Question 에러 관련 타입 =====
export type QuestionError = {
    message: string;
    statusCode?: number;
};
