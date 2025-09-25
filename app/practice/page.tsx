'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { UserInfo } from '@/lib/types';

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


const PracticePage = () => {
  const [
    userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    field: '',
    difficulty: '',
    category: '',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set());
  const [isBookmarking, setIsBookmarking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUserInfo = localStorage.getItem('userInfo');

      if (!token || !storedUserInfo) {
        router.push('/login');
        return;
      }

      try {
        // 토큰 검증
        const authResponse = await fetch('/api/auth/verify', {
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

        // 질문 목록 로드
        await loadQuestions();
        await loadBookmarks();
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const loadQuestions = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.field) queryParams.append('field', filters.field);
      if (filters.search) queryParams.append('query', filters.search);

      const response = await fetch(`/api/questions?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        let filteredQuestions = data.questions;

        // 클라이언트 사이드 필터링
        if (filters.difficulty) {
          filteredQuestions = filteredQuestions.filter((q: Question) => q.difficulty === filters.difficulty);
        }
        if (filters.category) {
          filteredQuestions = filteredQuestions.filter((q: Question) => q.category === filters.category);
        }

        setQuestions(filteredQuestions);
      }
    } catch (error) {
      console.error('Load questions error:', error);
    }
  };

  const loadBookmarks = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/bookmarks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const bookmarkedIds = new Set<number>(data.bookmarks.map((b: { questionId: number }) => b.questionId));
        setBookmarkedQuestions(bookmarkedIds);
      }
    } catch (error) {
      console.error('Load bookmarks error:', error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      loadQuestions();
    }
  }, [filters, userInfo]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const selectAllQuestions = () => {
    setSelectedQuestions(questions.map(q => q.id));
  };

  const clearSelection = () => {
    setSelectedQuestions([]);
  };

  const startRandomInterview = async () => {
    setIsStarting(true);
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Starting random interview with token:', token ? 'exists' : 'missing');
      
      const response = await fetch('/user/interviews/random?count=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Random questions response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Random questions data:', data);
        
        if (!data.questions || data.questions.length === 0) {
          alert('사용 가능한 질문이 없습니다. 관리자에게 문의하세요.');
          return;
        }
        
        // 랜덤 질문으로 면접 세션 생성
        const createResponse = await fetch('/user/interviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            questionIds: data.questions.map((q: Question) => q.id)
          })
        });

        console.log('Create session response status:', createResponse.status);

        if (createResponse.ok) {
          const sessionData = await createResponse.json();
          console.log('Session created:', sessionData);
          router.push(`/practice/${sessionData.id}`);
        } else {
          const errorData = await createResponse.json();
          console.error('Create session error:', errorData);
          alert(`면접 세션 생성에 실패했습니다: ${errorData.message || '알 수 없는 오류'}`);
        }
      } else {
        const errorData = await response.json();
        console.error('Random questions error:', errorData);
        alert(`질문을 불러오는데 실패했습니다: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Start random interview error:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsStarting(false);
    }
  };

  const startSelectedInterview = async () => {
    if (selectedQuestions.length === 0) return;

    setIsStarting(true);
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Starting selected interview with questions:', selectedQuestions);
      
      const response = await fetch('/user/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionIds: selectedQuestions
        })
      });

      console.log('Selected interview response status:', response.status);

      if (response.ok) {
        const sessionData = await response.json();
        console.log('Selected interview session created:', sessionData);
        router.push(`/practice/${sessionData.id}`);
      } else {
        const errorData = await response.json();
        console.error('Start selected interview error:', errorData);
        alert(`면접 세션 생성에 실패했습니다: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Start selected interview error:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsStarting(false);
    }
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

  const toggleBookmark = async (questionId: number) => {
    if (isBookmarking) return;
    
    setIsBookmarking(true);
    try {
      const token = localStorage.getItem('accessToken');
      const isBookmarked = bookmarkedQuestions.has(questionId);
      
      if (isBookmarked) {
        // 북마크 제거
        const response = await fetch('/api/bookmarks', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ questionId })
        });
        
        if (response.ok) {
          setBookmarkedQuestions(prev => {
            const newSet = new Set(prev);
            newSet.delete(questionId);
            return newSet;
          });
        }
      } else {
        // 북마크 추가
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ questionId })
        });
        
        if (response.ok) {
          setBookmarkedQuestions(prev => new Set([...prev, questionId]));
        }
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
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <Header userInfo={userInfo} />

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-gray-900 mb-2">면접 연습</h1>
          <p className="text-gray-600">질문을 선택하거나 랜덤 면접을 시작해보세요.</p>
        </div>

        {/* 빠른 시작 */}
        <div className="bg-white rounded-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-light text-gray-900 mb-4">빠른 시작</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={startRandomInterview}
              disabled={isStarting}
              className="bg-gray-900 text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? '시작 중...' : '랜덤 면접 시작 (5문제)'}
            </button>
            <button
              onClick={startSelectedInterview}
              disabled={selectedQuestions.length === 0 || isStarting}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              선택한 질문으로 시작 ({selectedQuestions.length}개)
            </button>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">필터</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">검색</label>
              <input
                type="text"
                placeholder="제목이나 내용으로 검색"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">분야</label>
              <select
                value={filters.field}
                onChange={(e) => handleFilterChange('field', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="">전체</option>
                <option value="프론트엔드 개발">프론트엔드 개발</option>
                <option value="백엔드 개발">백엔드 개발</option>
                <option value="풀스택 개발">풀스택 개발</option>
                <option value="데이터 사이언스">데이터 사이언스</option>
                <option value="AI/ML 엔지니어">AI/ML 엔지니어</option>
                <option value="DevOps">DevOps</option>
                <option value="모바일 개발">모바일 개발</option>
                <option value="게임 개발">게임 개발</option>
                <option value="공통">공통</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">난이도</label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="">전체</option>
                <option value="easy">쉬움</option>
                <option value="medium">보통</option>
                <option value="hard">어려움</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">카테고리</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="">전체</option>
                <option value="기술면접">기술면접</option>
                <option value="인성면접">인성면접</option>
              </select>
            </div>
          </div>
        </div>

        {/* 선택 컨트롤 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              총 {questions.length}개 질문
            </span>
            <span className="text-sm text-gray-600">
              {selectedQuestions.length}개 선택됨
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAllQuestions}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              전체 선택
            </button>
            <button
              onClick={clearSelection}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              선택 해제
            </button>
          </div>
        </div>

        {/* 질문 목록 */}
        <div className="space-y-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className={`bg-white border rounded-sm p-6 cursor-pointer transition-colors ${
                selectedQuestions.includes(question.id)
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
              onClick={() => toggleQuestionSelection(question.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
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
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {question.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{question.field}</span>
                    <div className="flex gap-1">
                      {question.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {question.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{question.tags.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* 북마크 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(question.id);
                    }}
                    disabled={isBookmarking}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    title={bookmarkedQuestions.has(question.id) ? '북마크 제거' : '북마크 추가'}
                  >
                    {bookmarkedQuestions.has(question.id) ? (
                      <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                  
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.id)}
                    onChange={() => toggleQuestionSelection(question.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">조건에 맞는 질문이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticePage;
