// ===== 공통 타입 =====
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
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
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

// ===== 인증 관련 타입 =====
export interface LoginRequest {
  userId: string;
  password: string;
}

export interface GoogleLoginRequest {
  authorizationCode: string;
}

export interface SignUpRequest {
  id: string;
  nickname: string;
  email: string;
  password: string;
  userType: "USER" | "ADMIN";
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleLoginResponse {
  userType: "USER" | "ADMIN";
  userId: string;
  name: string;
  accessToken: string;
  refreshToken: string;
}

export interface SignUpResponse {
  code: number;
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthError {
  error?: "UNREGISTERED_USER";
  message: string;
  statusCode?: number;
}

// ===== 문제 관련 타입 =====
export interface Question {
  id: number;
  question: string;
  company: string;
  year: number;
  category: string;
  tag?: string | null;
  field?: string | null;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionSearchParams {
  query?: string;
  category?: string;
  company?: string;
  year?: number;
  page?: number;
  size?: number;
}

export interface QuestionFilterRequest {
  category?: string;
  company?: string;
  year?: number;
}

export interface RandomQuestionFilterRequest {
  category?: string;
  company?: string;
  year?: number;
}

// ===== 관리자 문제 관리 타입 =====
export interface RegisterQuestionRequest {
  questions: { q: string }[];
}

export interface RegisterQuestionResponse {
  message: string;
  registeredQuestions: {
    id: number;
    q: string;
  }[];
}

export interface RegisterMultipleQuestionRequest {
  googleSheetUrl: string;
}

export interface RegisterMultipleQuestionResponse {
  message: string;
  data: {
    total: number;
  };
}

export interface EditQuestionRequest {
  q: string;
}

export interface EditQuestionResponse {
  id: number;
  message: string;
}

export interface DeleteQuestionResponse {
  id: number;
  message: string;
}

export interface DeleteMultipleQuestionRequest {
  questionIds: number[];
}

export interface DeleteMultipleQuestionResponse {
  ids: number[];
  message: string;
}

// ===== 면접 세션 관련 타입 =====
export interface CreateMockInterviewRequest {
  title: string;
  category: string;
  count: number;
}

export interface CreateMockInterviewResponse {
  id: number;
  title: string;
  questions: {
    id: number;
    question: string;
  }[];
  createdAt: string;
}

export interface RecordAnswerRequest {
  questionId: number;
  answer: string;
  timeSpent: number;
}

export interface RecordAnswerResponse {
  interviewId: number;
  questionId: number;
  answer: string;
  timeSpent: number;
  recordedAt: string;
}

export interface FinishInterviewResponse {
  interviewId: number;
  summary: {
    totalQuestions: number;
    totalTimeSpent: number;
    average: number;
    answers: {
      questionId: number;
      answer: string;
      timeSpent: number;
      recordedAt: string;
    }[];
  };
}

// ===== 북마크 관련 타입 =====
export interface CreateBookmarkFolderRequest {
  name: string;
}

export interface CreateBookmarkFolderResponse {
  folderId: number;
  name: string;
}

export interface BookmarkQuestionRequest {
  questionId: number;
  folderId: number;
}

export interface BookmarkQuestionResponse {
  bookmarkId: number;
  questionId: number;
  folderId: number;
}

export interface BookmarkFolder {
  folderId: number;
  name: string;
  bookmarks: {
    bookmarkId: number;
    questionId: number;
    question: string | null;
  }[];
}

export type BookmarkListResponse = BookmarkFolder[];

// ===== 대시보드 관련 타입 =====
export interface DashboardResponse {
  totalQuestions: number;
  totalBookmarks: number;
  totalInterviews: number;
  recentActivity: {
    title: string;
  }[];
}

// ===== 에러 관련 타입 =====
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
