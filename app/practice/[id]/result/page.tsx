'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { UserInfo } from '@/lib/types';
import { BaseURL } from '@/lib/util';

interface Question {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  field: string;
  company?: string;
  tags: string[];
}

interface InterviewAnswer {
  questionId: number;
  answer: string;
  timeSpent: number;
  score?: number;
  feedback?: string;
}

interface InterviewSession {
  id: number;
  userId: number;
  questions: Question[];
  answers: InterviewAnswer[];
  questionTimes?: { [questionId: number]: number }; // 각 질문별 소요 시간 (초)
  totalTime?: number; // 총 소요 시간 (초)
  status: 'in_progress' | 'completed';
  startedAt: string;
  finishedAt?: string;
  score?: number;
  feedback?: string;
}

const ResultPage = ({ params }: { params: Promise<{ id: string }> | { id: string } }) => {
  // Next.js 15 호환성을 위한 params 처리
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const sessionId = resolvedParams.id;

  const loadSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Result page: Loading session with ID:', sessionId);
      
      const response = await fetch(`${BaseURL}/user/interviews/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Result page: Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Result page: Session data received:', data);
        
        // API 응답이 직접 세션 객체인지 확인
        const sessionData = data.session || data;
        setSession(sessionData);
      } else {
        const errorData = await response.json();
        console.error('Result page: Load session error:', errorData);
        alert(`면접 결과를 불러올 수 없습니다: ${errorData.message || '알 수 없는 오류'}`);
        router.push('/practice');
      }
    } catch (error) {
      console.error('Result page: Load session error:', error);
      alert('네트워크 오류가 발생했습니다.');
      router.push('/practice');
    }
  }, [sessionId, router]);

  useEffect(() => {
    const checkAuthAndLoadSession = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUserInfo = localStorage.getItem('userInfo');

      if (!token || !storedUserInfo) {
        router.push('/login');
        return;
      }

      try {
        // 토큰 검증
        const authResponse = await fetch(`${BaseURL}/api/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!authResponse.ok) {
          localStorage.clear();
          router.push('/login');
          return;
        }

        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);

        // 세션 데이터 로드
        await loadSession();
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadSession();
  }, [router, sessionId, loadSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return difficulty;
    }
  };

  const getAverageTime = () => {
    if (!session || !session.answers || session.answers.length === 0) return 0;
    
    // questionTimes가 있으면 사용, 없으면 answers의 timeSpent 사용
    if (session.questionTimes) {
      const times = Object.values(session.questionTimes);
      return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    } else {
      const times = session.answers.map(a => a.timeSpent || 0);
      return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">세션을 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/practice')}
            className="bg-blue-600 text-white px-4 py-2 rounded-sm text-sm hover:bg-blue-700"
          >
            연습 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <Header userInfo={userInfo} />

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">🎉 면접 완료!</h1>
          <p className="text-gray-600">수고하셨습니다. 면접 결과를 확인해보세요.</p>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-sm border border-gray-100 p-6 text-center">
            <div className="text-2xl font-light text-blue-600 mb-2">{session.questions.length}</div>
            <div className="text-sm text-gray-600">총 질문 수</div>
          </div>
          <div className="bg-white rounded-sm border border-gray-100 p-6 text-center">
            <div className="text-2xl font-light text-green-600 mb-2">{formatTime(session.totalTime || 0)}</div>
            <div className="text-sm text-gray-600">총 소요 시간</div>
          </div>
          <div className="bg-white rounded-sm border border-gray-100 p-6 text-center">
            <div className="text-2xl font-light text-purple-600 mb-2">{formatTime(getAverageTime())}</div>
            <div className="text-sm text-gray-600">평균 답변 시간</div>
          </div>
          <div className="bg-white rounded-sm border border-gray-100 p-6 text-center">
            <div className="text-2xl font-light text-orange-600 mb-2">
              {session.answers?.length || 0}
            </div>
            <div className="text-sm text-gray-600">답변한 질문</div>
          </div>
        </div>

        {/* 면접 상세 결과 */}
        <div className="bg-white rounded-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-light text-gray-900 mb-6">면접 상세 결과</h2>
          
          <div className="space-y-6">
            {session.questions.map((question, index) => {
              // answers는 배열이므로 해당 질문의 답변을 찾아야 함
              const answerObj = session.answers?.find(a => a.questionId === question.id);
              const answer = answerObj?.answer || '';
              const timeSpent = session.questionTimes?.[question.id] || answerObj?.timeSpent || 0;
              
              return (
                <div key={question.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-500">Q{index + 1}.</span>
                        <h3 className="font-medium text-gray-900">{question.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(question.difficulty)}`}>
                          {getDifficultyText(question.difficulty)}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {question.category}
                        </span>
                        {question.company && (
                          <span className="px-2 py-1 text-xs bg-black text-white rounded-full">
                            {question.company}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{question.content}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">{question.field}</span>
                        <div className="flex gap-1">
                          {question.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span key={tagIndex} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatTime(timeSpent)}
                      </div>
                      <div className="text-xs text-gray-500">소요 시간</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-sm p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">내 답변</h4>
                    {answer ? (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{answer}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">답변하지 않음</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push('/practice')}
            className="bg-blue-600 text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            다시 연습하기
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
