import api from '@/lib/api';
import {
  CreateMockInterviewRequest,
  CreateMockInterviewResponse,
  RecordAnswerRequest,
  RecordAnswerResponse,
  FinishInterviewResponse,
} from '@/types/api';

export const interviewService = {
  // 모의 면접 세션 생성
  createMockInterview: async (data: CreateMockInterviewRequest): Promise<CreateMockInterviewResponse> => {
    const response = await api.post<CreateMockInterviewResponse>('/user/interviews', data);
    return response.data;
  },

  // 세션별 문항/답변 기록
  recordAnswer: async (interviewId: number, data: RecordAnswerRequest): Promise<RecordAnswerResponse> => {
    const response = await api.post<RecordAnswerResponse>(`/user/interviews/${interviewId}`, data);
    return response.data;
  },

  // 면접 종료
  finishInterview: async (interviewId: number): Promise<FinishInterviewResponse> => {
    console.log('Finishing interview with ID:', interviewId);
    const token = localStorage.getItem('accessToken');
    console.log('Access token:', token ? 'Present' : 'Missing');
    console.log('Token length:', token?.length || 0);
    
    try {
      const response = await api.get<FinishInterviewResponse>(`/user/interviews/${interviewId}/finish`);
      return response.data;
    } catch (error) {
      console.error('Finish interview error:', error);
      throw error;
    }
  },
};
