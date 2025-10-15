'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import { questionService } from '@/services/questionService';
import { sessionService } from '@/services/sessionService';
import { bookmarkService } from '@/services/bookmarkService';
import { question, session } from '@/types';

const PracticePage = () => {
  const { data: session, status } = useSession();
  const [questions, setQuestions] = useState<question.Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    company: '',
    year: '',
    category: '',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set());
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    category: '',
    company: '',
    year: 0
  });
  const router = useRouter();

  const loadQuestions = useCallback(async () => {
    try {
      if (filters.search) {
        const data = await questionService.searchQuestions(filters.search, 0, 100);
        setQuestions(data.questions);
      } else if (filters.company || filters.year || filters.category) {
        const data = await questionService.searchQuestionByCategory({
          company: filters.company || '',
          year: filters.year ? parseInt(filters.year) : 0,
          category: filters.category || ''
        }, 0, 100);
        setQuestions(data.questions);
      } else {
        const data = await questionService.searchAllQuestions(0, 100);
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Load questions error:', error);
    }
  }, [filters]);

  useEffect(() => {
    const loadData = async () => {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }

      try {
        await Promise.all([loadQuestions(), loadBookmarks()]);
      } catch (error) {
        console.error('Load data error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [status, router, loadQuestions]);

  const loadBookmarks = async () => {
    try {
      const folders = await bookmarkService.getBookmarkFolders();
      const bookmarkedIds = new Set<number>();
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

  useEffect(() => {
    if (session) {
      loadQuestions();
    }
  }, [session, loadQuestions]);

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
      await questionService.randomlySelectInterviewQuestion();
      
      const sessionData = await sessionService.createMockInterview({
        title: '랜덤 면접',
        category: '기술면접',
        count: 1
      });
      
      router.push(`/practice/${sessionData.id}`);
    } catch (error: unknown) {
      console.error('Start random interview error:', error);
      alert(error instanceof Error ? error.message : '면접 시작에 실패했습니다.');
    } finally {
      setIsStarting(false);
    }
  };

  const startSelectedInterview = async () => {
    if (selectedQuestions.length === 0) return;

    setIsStarting(true);
    try {
      const sessionData = await sessionService.createMockInterview({
        title: '선택한 질문 면접',
        category: '기술면접',
        count: selectedQuestions.length
      });
      
      router.push(`/practice/${sessionData.id}`);
    } catch (error: unknown) {
      console.error('Start selected interview error:', error);
      alert(error instanceof Error ? error.message : '면접 시작에 실패했습니다.');
    } finally {
      setIsStarting(false);
    }
  };

  const startAdvancedRandomInterview = async () => {
    setIsStarting(true);
    try {
      await questionService.randomlySelectInterviewQuestionByFilters(advancedFilters);
      
      const sessionData = await sessionService.createMockInterview({
        title: '필터링된 면접',
        category: advancedFilters.category || '기술면접',
        count: 1
      });
      
      router.push(`/practice/${sessionData.id}`);
    } catch (error: unknown) {
      console.error('Advanced random interview error:', error);
      alert(error instanceof Error ? error.message : '면접 시작에 실패했습니다.');
    } finally {
      setIsStarting(false);
    }
  };


  const toggleBookmark = async (questionId: number) => {
    if (isBookmarking) return;
    
    setIsBookmarking(true);
    try {
      const isBookmarked = bookmarkedQuestions.has(questionId);
      
      if (isBookmarked) {
        // 북마크 제거 - 실제로는 북마크 ID가 필요하지만 여기서는 간단히 처리
        await loadBookmarks();
      } else {
        // 북마크 추가 - 기본 폴더에 추가
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
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <Header userInfo={{
        userId: session?.user?.id || 0,
        name: session?.user?.name || '',
        userType: session?.user?.userType || 'user',
        onboardingCompleted: session?.user?.onboardingCompleted || false
      }} />

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
            <button
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className="border border-blue-300 text-blue-700 px-6 py-3 rounded-sm text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              {showAdvancedFilter ? '고급 필터 숨기기' : '고급 필터로 시작'}
            </button>
          </div>
        </div>

        {/* 고급 필터 */}
        {showAdvancedFilter && (
          <div className="bg-white rounded-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-light text-gray-900 mb-4">고급 필터로 랜덤 면접</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1">카테고리</label>
                <input
                  type="text"
                  placeholder="카테고리"
                  value={advancedFilters.category}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">회사</label>
                <input
                  type="text"
                  placeholder="회사명"
                  value={advancedFilters.company}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">연도</label>
                <input
                  type="number"
                  placeholder="연도"
                  value={advancedFilters.year || ''}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={startAdvancedRandomInterview}
                disabled={isStarting}
                className="bg-blue-600 text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting ? '시작 중...' : '고급 필터로 면접 시작'}
              </button>
            </div>
          </div>
        )}

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
              <label className="block text-xs text-gray-500 mb-1">회사</label>
              <input
                type="text"
                placeholder="회사명"
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">연도</label>
              <input
                type="number"
                placeholder="연도"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
              />
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
                    <h3 className="font-medium text-gray-900">{question.question}</h3>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {question.category}
                    </span>
                    <span className="px-2 py-1 text-xs bg-black text-white rounded-full">
                      {question.company}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                      {question.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">ID: {question.id}</span>
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
