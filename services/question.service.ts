import api from '@/lib/api';
import {
  Question,
  QuestionSearchParams,
  QuestionFilterRequest,
  RandomQuestionFilterRequest,
  PaginatedResponse,
  RegisterQuestionRequest,
  RegisterQuestionResponse,
  RegisterMultipleQuestionRequest,
  RegisterMultipleQuestionResponse,
  EditQuestionRequest,
  EditQuestionResponse,
  DeleteQuestionResponse,
  DeleteMultipleQuestionRequest,
  DeleteMultipleQuestionResponse,
} from '@/types/api';

export const questionService = {
  // 질문 목록 조회
  getQuestions: async (params?: QuestionSearchParams): Promise<PaginatedResponse<Question>> => {
    console.log('=== GET QUESTIONS DEBUG ===');
    console.log('API Base URL:', api.defaults.baseURL);
    console.log('Full URL:', `${api.defaults.baseURL}/api/questions`);
    console.log('Params:', params);
    console.log('Headers:', api.defaults.headers);
    console.log('===========================');
    
    try {
      const response = await api.get<PaginatedResponse<Question>>('/api/questions', { params });
      console.log('Questions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get questions error:', error);
      throw error;
    }
  },

  // 질문 단건 조회
  getQuestionById: async (questionId: number): Promise<Question> => {
    const response = await api.get<Question>(`/api/questions/${questionId}`);
    return response.data;
  },

  // 질문 필터 검색
  searchQuestions: async (filters: QuestionFilterRequest): Promise<PaginatedResponse<Question>> => {
    const response = await api.post<PaginatedResponse<Question>>('/api/questions/search', filters);
    return response.data;
  },

  // 랜덤 질문 추출
  getRandomQuestion: async (): Promise<Question> => {
    const response = await api.get<Question>('/user/interviews/random');
    return response.data;
  },

  // 범위 지정 랜덤 질문 추출
  getRandomQuestionWithFilter: async (filters: RandomQuestionFilterRequest): Promise<Question> => {
    const response = await api.post<Question>('/api/interviews/random/filter', filters);
    return response.data;
  },

  // === 관리자 기능 ===

  // 질문 단건 등록
  registerQuestion: async (data: RegisterQuestionRequest): Promise<RegisterQuestionResponse> => {
    const response = await api.post<RegisterQuestionResponse>('/admin/questions', data);
    return response.data;
  },

  // 질문 일괄 등록 (Google Sheets)
  registerMultipleQuestions: async (data: RegisterMultipleQuestionRequest): Promise<RegisterMultipleQuestionResponse> => {
    const response = await api.post<RegisterMultipleQuestionResponse>('/admin/questions/sheets', data, {
      timeout: 300000, // 5분 타임아웃
    });
    return response.data;
  },

  // 질문 수정
  editQuestion: async (questionId: number, data: EditQuestionRequest): Promise<EditQuestionResponse> => {
    console.log('=== EDIT QUESTION DEBUG ===');
    console.log('Question ID:', questionId);
    console.log('Edit data:', data);
    console.log('API Base URL:', api.defaults.baseURL);
    console.log('Full URL:', `${api.defaults.baseURL}/admin/questions/${questionId}`);
    console.log('Headers:', api.defaults.headers);
    console.log('============================');
    
    try {
      const response = await api.patch<EditQuestionResponse>(`/admin/questions/${questionId}`, data);
      console.log('Edit response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Edit error details:', error);
      throw error;
    }
  },

  // 질문 단건 삭제
  deleteQuestion: async (questionId: number): Promise<DeleteQuestionResponse> => {
    console.log('=== DELETE QUESTION DEBUG ===');
    console.log('Question ID:', questionId);
    console.log('API Base URL:', api.defaults.baseURL);
    console.log('Full URL:', `${api.defaults.baseURL}/admin/questions/${questionId}`);
    console.log('Headers:', api.defaults.headers);
    console.log('Authorization header:', api.defaults.headers.Authorization);
    
    const token = localStorage.getItem('accessToken');
    console.log('Token from localStorage:', token);
    console.log('Token length:', token?.length);
    console.log('==============================');
    
    try {
      const response = await api.delete<DeleteQuestionResponse>(`/admin/questions/${questionId}`);
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete error details:', error);
      throw error;
    }
  },

  // 질문 일괄 삭제
  deleteMultipleQuestions: async (data: DeleteMultipleQuestionRequest): Promise<DeleteMultipleQuestionResponse> => {
    const response = await api.delete<DeleteMultipleQuestionResponse>('/admin/questions', { data });
    return response.data;
  },
};
