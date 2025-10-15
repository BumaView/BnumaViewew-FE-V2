'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sessionService } from '@/services/sessionService';
import { bookmarkService } from '@/services/bookmarkService';
import { bookmark } from '@/types';

interface Question {
  id: number;
  question: string;
}

interface InterviewAnswer {
  questionId: number;
  answer: string;
  timeSpent: number;
  recordedAt: string;
}

interface InterviewSession {
  interviewId: number;
  status: 'in_progress' | 'completed';
  summary: {
    totalQuestions: number;
    totalTimeSpent: number;
    average: number;
    answers: InterviewAnswer[];
  };
  feedback: string;
  questions: Question[];
  createdAt: string;
}

const InterviewSessionPage = ({ params }: { params: Promise<{ id: string }> | { id: string } }) => {
  // Next.js 15 호환성을 위한 params 처리
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalStartTime, setTotalStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(0); // 현재 질문 타이머 (초)
  const [totalTime, setTotalTime] = useState(0); // 전체 면접 타이머 (초)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set());
  const [isBookmarking, setIsBookmarking] = useState(false);
  const currentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const loadSession = useCallback(async () => {
    try {
      console.log('Loading session with ID:', resolvedParams.id);
      
      const sessionData = await sessionService.getInterviewById(parseInt(resolvedParams.id));
      console.log('Session data loaded:', sessionData);
      
      if (!sessionData.questions || sessionData.questions.length === 0) {
        console.error('Session has no questions');
        alert('면접 세션에 질문이 없습니다.');
        router.push('/practice');
        return;
      }
      
      setSession(sessionData);
      
      // 이미 답변한 질문이 있다면 다음 질문으로 이동
      if (sessionData.summary.answers && sessionData.summary.answers.length > 0) {
        setCurrentQuestionIndex(Math.min(sessionData.summary.answers.length, sessionData.questions.length - 1));
      }
      
      // 완료된 면접이라면 결과 페이지로 이동
      if (sessionData.status === 'completed') {
        router.push(`/practice/${resolvedParams.id}/result`);
      }
    } catch (error) {
      console.error('Load session error:', error);
      alert('네트워크 오류가 발생했습니다.');
      router.push('/practice');
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    loadSession();
    loadBookmarks();
  }, [loadSession]);

  useEffect(() => {
    // 질문이 바뀔 때마다 시작 시간 기록
    setStartTime(new Date());
    setCurrentTime(0);
    
    // 현재 질문 타이머 시작
    if (currentTimerRef.current) {
      clearInterval(currentTimerRef.current);
    }
    currentTimerRef.current = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (currentTimerRef.current) {
        clearInterval(currentTimerRef.current);
      }
    };
  }, [currentQuestionIndex]);

  useEffect(() => {
    // 면접 시작 시 전체 타이머 시작
    if (session && !totalStartTime) {
      setTotalStartTime(new Date());
      
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
      }
      totalTimerRef.current = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
      }
    };
  }, [session, totalStartTime]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (currentTimerRef.current) {
        clearInterval(currentTimerRef.current);
      }
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
      }
    };
  }, []);

  const loadBookmarks = async () => {
    try {
      const response = await bookmarkService.getBookmarkFolders();
      const bookmarkedIds = new Set<number>();
      
      // 백엔드 응답 구조에 따라 처리
      let folders: bookmark.GetBookmarkedFolderListResponse;
      if (Array.isArray(response)) {
        folders = response;
      } else if (response && 'content' in response) {
        folders = response.content;
      } else {
        console.error('Unexpected bookmarks response structure:', response);
        return;
      }
      
      folders.forEach(folder => {
        folder.bookmarks.forEach(bookmark => {
          bookmarkedIds.add(bookmark.questionId);
        });
      });
      setBookmarkedQuestions(bookmarkedIds);
    } catch (error) {
      console.error('Load bookmarks error:', error);
    }
  };

  const submitAnswer = async () => {
    if (!session || !startTime || !currentAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      const timeSpent = currentTime; // 타이머에서 가져온 시간 사용
      
      await sessionService.recordAnswer(session.interviewId, {
        questionId: session.questions[currentQuestionIndex].id,
        answer: currentAnswer,
        timeSpent
      });

      setCurrentAnswer('');
      
      // 다음 질문으로 이동
      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // 모든 질문에 답변했다면 면접 종료
        finishInterview();
      }
    } catch (error) {
      console.error('Submit answer error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishInterview = async () => {
    if (!session) return;

    // 타이머 정지
    if (currentTimerRef.current) {
      clearInterval(currentTimerRef.current);
    }
    if (totalTimerRef.current) {
      clearInterval(totalTimerRef.current);
    }

    setIsFinishing(true);
    try {
      await sessionService.finishInterview(session.interviewId, totalTime);
      router.push(`/practice/${session.interviewId}/result`);
    } catch (error) {
      console.error('Finish interview error:', error);
    } finally {
      setIsFinishing(false);
    }
  };

  const skipQuestion = () => {
    if (!session) return;
    
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // 이전 답변이 있다면 불러오기
      const previousAnswer = session?.summary.answers.find(a => a.questionId === session.questions[currentQuestionIndex - 1].id);
      setCurrentAnswer(previousAnswer?.answer || '');
    }
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleBookmark = async (questionId: number) => {
    if (isBookmarking) return;
    
    setIsBookmarking(true);
    try {
      const isBookmarked = bookmarkedQuestions.has(questionId);
      
      if (isBookmarked) {
        // 북마크 제거
        await bookmarkService.unbookmarkingQuestion(questionId);
        setBookmarkedQuestions(prev => {
          const newSet = new Set(prev);
          newSet.delete(questionId);
          return newSet;
        });
      } else {
        // 북마크 추가
        await bookmarkService.bookmarkingQuestion({
          questionId: questionId,
          folderId: 1 // 기본 폴더 ID
        });
        setBookmarkedQuestions(prev => new Set([...prev, questionId]));
      }
    } catch (error) {
      console.error('Bookmark toggle error:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">면접을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">면접 세션을 찾을 수 없습니다.</p>
          <Link href="/practice" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            면접 연습으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;
  const answeredCount = session.summary.answers.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-light text-gray-900">면접 진행 중</h1>
              <p className="text-sm text-gray-500">
                {currentQuestionIndex + 1} / {session.questions.length} 문제
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                답변 완료: {answeredCount}개
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-blue-600 font-medium">
                  현재 질문: {formatTime(currentTime)}
                </div>
                <div className="text-sm text-green-600 font-medium">
                  총 시간: {formatTime(totalTime)}
                </div>
              </div>
              <button
                onClick={finishInterview}
                disabled={isFinishing}
                className="text-sm text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
              >
                {isFinishing ? '종료 중...' : '면접 종료'}
              </button>
            </div>
          </div>
          
          {/* 진행률 바 */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-sm border border-gray-100 p-8">
          {/* 질문 정보 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                  면접 질문
                </span>
              </div>
              
              {/* 북마크 버튼 */}
              <button
                onClick={() => toggleBookmark(currentQuestion.id)}
                disabled={isBookmarking}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                title={bookmarkedQuestions.has(currentQuestion.id) ? '북마크 제거' : '북마크 추가'}
              >
                {bookmarkedQuestions.has(currentQuestion.id) ? (
                  <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
            </div>
            
            <h2 className="text-2xl font-light text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>
            
            <div className="bg-gray-50 rounded-sm p-6 mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.question}
              </p>
            </div>

          </div>

          {/* 답변 입력 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              답변을 작성해주세요
            </label>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="면접관에게 답변하듯이 자세하고 구체적으로 작성해주세요..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors resize-none"
            />
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {currentAnswer.length} 글자
              </span>
              <span className="text-xs text-gray-500">
                Tip: 구체적인 예시와 경험을 포함해보세요
              </span>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-sm text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전 질문
              </button>
              <button
                onClick={skipQuestion}
                disabled={currentQuestionIndex === session.questions.length - 1}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-sm text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                건너뛰기
              </button>
            </div>

            <div className="flex space-x-3">
              {currentQuestionIndex === session.questions.length - 1 ? (
                <button
                  onClick={submitAnswer}
                  disabled={!currentAnswer.trim() || isSubmitting}
                  className="bg-red-600 text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '제출 중...' : '답변 제출 후 면접 종료'}
                </button>
              ) : (
                <button
                  onClick={submitAnswer}
                  disabled={!currentAnswer.trim() || isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '제출 중...' : '답변 제출 후 다음 질문'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 질문 네비게이션 */}
        <div className="mt-6 bg-white rounded-sm border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">질문 목록</h3>
          <div className="flex gap-2 flex-wrap">
            {session.questions.map((question, index) => {
              const isAnswered = session.summary.answers.some(a => a.questionId === question.id);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`px-3 py-2 text-sm rounded-sm transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isAnswered
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                  {isAnswered && !isCurrent && (
                    <span className="ml-1">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSessionPage;
