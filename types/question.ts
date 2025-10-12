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
    tags: string[];
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
    questions: T[];
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
export type RegisterSingleQuestionRequest = {
    questions: [
        {q: string}
    ]
};

export type RegisterSingleQuestionResponse = {
    message: string;
};

export type RegisterMultipleQuestionRequest = {
    googleSheetUrl: string;
};

export type RegisterMultipleQuestionResponse = {
    total: number;
    message: string;
};

export type EditQuestionRequest = {
    id: number;
    question: string;
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
    category: string[];
    field: string[];
};

export type SearchQuestionByCategoryResponse = PaginatedResponse<Question>;

export type SearchQuestionListResponse = PaginatedResponse<Question>;

export type SearchQuestionByIdResponse = QuestionDetail;

// ===== Question 랜덤 선택 관련 타입 =====
export type RandomlySelectInterviewQuestionResponse = {
    id: number;
    tag: string[];
    question: string;
    category: string;
    company: string;
    field: string[];
    year: number;
};

export type RandomlySelectInterviewQuestionByFiltersRequest = {
    tags: string[];
    category: string;
    company: string;
    field: string[];
    year: number;
};

export type RandomlySelectInterviewQuestionByFiltersResponse = {
    id: number;
    tags: string[];
    question: string;
    category: string;
    company: string;
    field: string[];
    year: number;
};

// ===== Question 에러 관련 타입 =====
export type QuestionError = {
    message: string;
    statusCode?: number;
};
