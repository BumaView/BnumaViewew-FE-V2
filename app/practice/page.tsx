'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { sessionService } from '@/services/sessionService';
import { bookmarkService } from '@/services/bookmarkService';
import { questionService } from '@/services/questionService';
import { question, bookmark } from '@/types';
import { UserInfo } from '@/lib/types';

// API 에러 응답 타입 정의
interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  code?: string;
}

const PracticePage = () => {
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
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [bookmarkFolders, setBookmarkFolders] = useState<bookmark.GetBookmarkedFolderListResponse>([]);
  const [allBookmarks, setAllBookmarks] = useState<bookmark.GetBookmarkedQuestionsInFolderResponse[]>([]);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [selectedQuestionForBookmark, setSelectedQuestionForBookmark] = useState<number | null>(null);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [availableCategories] = useState([
    '전체',
    '백엔드',
    '프론트엔드', 
    'AI',
    '은행',
    '게임',
    '디자인',
    '보안',
    '인프라',
    '임베디드'
  ]);
  const [advancedFilters, setAdvancedFilters] = useState({
    category: '',
    company: '',
    year: 0
  });
  const router = useRouter();

  const loadQuestions = useCallback(async () => {
    try {
      console.log('Loading questions with filters:', filters);
      
      // 실제 백엔드 API에서 질문 목록 가져오기
      let response;
      
      if (filters.category || filters.company || filters.year) {
        // 카테고리 검색
        response = await questionService.searchCategories(filters);
      } else {
        // 검색어가 없으면 전체 질문 목록 가져오기
        response = await questionService.searchAllQuestions(0, 100);
      }
      
      const questions = response.content || [];

      setQuestions(questions);
    } catch (error) {
      console.error('Error loading questions:', error);
      // 에러 발생 시 빈 배열로 설정
      setQuestions([]);
    }
  }, [filters]);


  const loadBookmarkFolders = async () => {
    try {
      console.log('Loading bookmark folders...');
      const response = await bookmarkService.getBookmarkFolders();
      console.log('Bookmark folders response:', response);
      
      let folders: bookmark.GetBookmarkedFolderListResponse;
      if (Array.isArray(response)) {
        folders = response;
      } else if (response && 'content' in response) {
        folders = response.content;
      } else {
        console.error('Unexpected bookmarks response structure:', response);
        folders = [];
      }
      
      setBookmarkFolders(folders);
    } catch (error) {
      console.error('Load bookmark folders error:', error);
    }
  };

  const loadBookmarks = async () => {
    try {
      console.log('Loading bookmarks...');
      const response = await bookmarkService.getBookmarkFolders();
      console.log('Bookmarks response:', response);
      
      const bookmarkedIds = new Set<number>();
      const allBookmarksData: bookmark.GetBookmarkedQuestionsInFolderResponse[] = [];
      
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
      
      console.log('Processing folders:', folders);
      
      // 각 폴더의 북마크들을 개별적으로 로드
      for (const folder of folders) {
        try {
          console.log(`Loading bookmarks for folder ${folder.folderId}...`);
          const folderBookmarks = await bookmarkService.getBookmarkedQuestionsInFolder(folder.folderId);
          console.log(`Folder ${folder.folderId} bookmarks:`, folderBookmarks);
          
          allBookmarksData.push(folderBookmarks);
          
          if (Array.isArray(folderBookmarks.bookmarks)) {
            folderBookmarks.bookmarks.forEach((bookmark) => {
              console.log(`Adding bookmark:`, bookmark);
              bookmarkedIds.add(bookmark.questionId);
            });
          }
        } catch (error) {
          console.error(`Error loading bookmarks for folder ${folder.folderId}:`, error);
          // 폴더별 북마크 로드 실패 시 폴더의 bookmarks 배열 사용 (fallback)
          if (Array.isArray(folder.bookmarks)) {
            folder.bookmarks.forEach((bookmark) => {
              bookmarkedIds.add(bookmark.questionId);
            });
          }
        }
      }
      
      console.log('Bookmarked question IDs:', Array.from(bookmarkedIds));
      setBookmarkedQuestions(bookmarkedIds);
      
      // allBookmarks 상태도 업데이트
      setAllBookmarks(allBookmarksData);
    } catch (error) {
      console.error('Load bookmarks error:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // localStorage에서 토큰 확인
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        router.push('/login');
        return;
      }

      // localStorage에서 사용자 정보 가져오기
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }

      try {
        await loadQuestions();
        await loadBookmarkFolders();
        await loadBookmarks();
      } catch (error) {
        console.error('Load data error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadQuestions, router]);

  // 필터가 변경될 때마다 질문 목록 다시 로드
  useEffect(() => {
    if (!isLoading) {
      loadQuestions();
    }
  }, [filters, loadQuestions, isLoading]);

  // 페이지 포커스 시 북마크 목록 다시 로드
  useEffect(() => {
    const handleFocus = () => {
      console.log('Page focused, reloading bookmarks...');
      loadBookmarks();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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
      console.log('Starting random interview...');
      
      // 토큰 확인 및 유효성 검사
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        router.push('/login');
        return;
      }
      
      console.log('Token found, creating random interview session...');

      // 백엔드에서 랜덤 면접 세션 생성
      const sessionData = await sessionService.createMockInterview({
        title: '랜덤 면접',
        category: '기술면접',
        count: 5 // 5개 질문
      });
      
      console.log('Random interview session created:', sessionData);
      router.push(`/practice/${sessionData.id}`);
    } catch (error: unknown) {
      console.error('Start random interview error:', error);
      
      // 네트워크 에러 처리
      if (error && typeof error === 'object' && 'isNetworkError' in error) {
        alert('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
        return;
      }
      
      // API 에러 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: ApiErrorResponse } };
        const status = axiosError.response?.status;
        const responseData = axiosError.response?.data;
        
        if (status === 403) {
          alert('API 접근 권한이 없습니다. 로그인을 다시 시도해주세요.');
          // 토큰 제거 후 로그인 페이지로 이동
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          router.push('/login');
        } else if (status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          router.push('/login');
        } else if (status === 404) {
          alert('요청한 리소스를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else if (status && status >= 500) {
          alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          const errorMessage = responseData?.message || '면접 시작에 실패했습니다.';
          alert(errorMessage);
        }
      } else {
        alert('면접 시작에 실패했습니다.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  const startSelectedInterview = async () => {
    if (selectedQuestions.length === 0) return;

    setIsStarting(true);
    try {
      // 토큰 확인
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        router.push('/login');
        return;
      }

      const sessionData = await sessionService.createMockInterview({
        title: '선택한 질문 면접',
        category: '기술면접',
        count: selectedQuestions.length
      });
      
      router.push(`/practice/${sessionData.id}`);
    } catch (error: unknown) {
      console.error('Start selected interview error:', error);
      
      // 네트워크 에러 처리
      if (error && typeof error === 'object' && 'isNetworkError' in error) {
        alert('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
        return;
      }
      
      // API 에러 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: ApiErrorResponse } };
        const status = axiosError.response?.status;
        const responseData = axiosError.response?.data;
        
        if (status === 403) {
          alert('API 접근 권한이 없습니다. 로그인을 다시 시도해주세요.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          router.push('/login');
        } else if (status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          router.push('/login');
        } else if (status === 404) {
          alert('요청한 리소스를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else if (status && status >= 500) {
          alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          const errorMessage = responseData?.message || '면접 시작에 실패했습니다.';
          alert(errorMessage);
        }
      } else {
        alert('면접 시작에 실패했습니다.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  const startAdvancedRandomInterview = async () => {
    setIsStarting(true);
    try {
      console.log('Starting advanced random interview with filters:', advancedFilters);
      
      // 카테고리 유효성 검사
      if (advancedFilters.category && !availableCategories.includes(advancedFilters.category)) {
        alert('유효하지 않은 카테고리입니다. 목록에서 선택해주세요.');
        setIsStarting(false);
        return;
      }
      
      // 토큰 확인 및 유효성 검사
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        router.push('/login');
        return;
      }
      
      console.log('Token found, getting filtered random interview from server...');
      
      // 백엔드에서 필터링된 랜덤 질문 가져오기
      const filteredQuestion = await questionService.randomlySelectInterviewQuestionByFilters({
        category: advancedFilters.category,
        company: advancedFilters.company,
        year: advancedFilters.year
      });
      console.log('Filtered question received:', filteredQuestion);
      
      // 필터링된 질문으로 면접 세션 생성
      const sessionData = await sessionService.createMockInterview({
        title: '필터링된 면접',
        category: advancedFilters.category || '기술면접',
        count: 1 // 랜덤 질문 1개
      });
      
      console.log('Advanced session created:', sessionData);
      router.push(`/practice/${sessionData.id}`);
    } catch (error: unknown) {
      console.error('Advanced random interview error:', error);
      
      // 네트워크 에러 처리
      if (error && typeof error === 'object' && 'isNetworkError' in error) {
        alert('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
        return;
      }
      
      // API 에러 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: ApiErrorResponse } };
        const status = axiosError.response?.status;
        const responseData = axiosError.response?.data;
        
        if (status === 403) {
          alert('API 접근 권한이 없습니다. 로그인을 다시 시도해주세요.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          router.push('/login');
        } else if (status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          router.push('/login');
        } else if (status === 404) {
          alert('요청한 리소스를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else if (status && status >= 500) {
          alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          const errorMessage = responseData?.message || '면접 시작에 실패했습니다.';
          alert(errorMessage);
        }
      } else {
        alert('면접 시작에 실패했습니다.');
      }
    } finally {
      setIsStarting(false);
    }
  };


  const toggleBookmark = async (questionId: number) => {
    if (isBookmarking) return;
    
    const isBookmarked = bookmarkedQuestions.has(questionId);
    console.log(`Toggling bookmark for question ${questionId}, currently bookmarked: ${isBookmarked}`);
    
    if (isBookmarked) {
      // 북마크 제거
      await removeBookmark(questionId);
    } else {
      // 북마크 추가 - 폴더 선택 모달 표시
      setSelectedQuestionForBookmark(questionId);
      setShowBookmarkModal(true);
    }
  };

  const removeBookmark = async (questionId: number) => {
    setIsBookmarking(true);
    try {
      // 모든 폴더에서 해당 질문의 북마크를 찾아서 제거
      const folders = await bookmarkService.getBookmarkFolders();
      let foldersToCheck: bookmark.GetBookmarkedFolderListResponse;
      if (Array.isArray(folders)) {
        foldersToCheck = folders;
      } else if (folders && 'content' in folders) {
        foldersToCheck = folders.content;
      } else {
        throw new Error('Invalid folders response');
      }
      
      for (const folder of foldersToCheck) {
        const bookmark = folder.bookmarks.find(b => b.questionId === questionId);
        if (bookmark) {
          await bookmarkService.unbookmarkingQuestion(bookmark.bookmarkId);
          console.log(`Removed bookmark for question ${questionId}`);
          break;
        }
      }
      
      // 북마크 제거 후 전체 북마크 목록 다시 로드
      await loadBookmarks();
    } catch (error) {
      console.error('Error removing bookmark:', error);
      alert('북마크 제거에 실패했습니다.');
    } finally {
      setIsBookmarking(false);
    }
  };

  const addBookmarkToFolder = async (folderId: number) => {
    if (!selectedQuestionForBookmark) return;
    
    setIsBookmarking(true);
    try {
      console.log(`Adding bookmark for question ${selectedQuestionForBookmark} to folder ${folderId}...`);
      const response = await bookmarkService.bookmarkingQuestion({
        questionId: selectedQuestionForBookmark,
        folderId: folderId
      });
      console.log('Bookmark added successfully:', response);
      
      // 북마크 추가 후 전체 북마크 목록 다시 로드
      await loadBookmarks();
      
      // 모달 닫기
      setShowBookmarkModal(false);
      setSelectedQuestionForBookmark(null);
    } catch (error) {
      console.error('Error adding bookmark:', error);
      
      // 네트워크 에러 처리
      if (error && typeof error === 'object' && 'isNetworkError' in error) {
        alert('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
        return;
      }
      
      // API 에러 처리
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: ApiErrorResponse } };
        const status = axiosError.response?.status;
        const responseData = axiosError.response?.data;
        
        if (status === 403) {
          alert('API 접근 권한이 없습니다. 로그인을 다시 시도해주세요.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          router.push('/login');
        } else if (status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          router.push('/login');
        } else if (status === 409) {
          alert('이미 북마크된 질문입니다.');
        } else if (status === 404) {
          alert('요청한 리소스를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else if (status && status >= 500) {
          alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          const errorMessage = responseData?.message || '북마크 추가에 실패했습니다.';
          alert(errorMessage);
        }
      } else {
        alert('북마크 추가에 실패했습니다.');
      }
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
                <select
                  value={advancedFilters.category}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-black text-sm focus:outline-none focus:border-gray-400"
                >
                  <option value="">카테고리 선택</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category === '전체' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">회사</label>
                <input
                  type="text"
                  placeholder="회사명"
                  value={advancedFilters.company}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-black text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">연도</label>
                <input
                  type="number"
                  placeholder="연도"
                  value={advancedFilters.year || ''}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-black text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  // 필터 적용
                  setFilters({
                    company: advancedFilters.company,
                    year: advancedFilters.year.toString(),
                    category: advancedFilters.category,
                    search: ''
                  });
                  setShowAdvancedFilter(false);
                }}
                className="bg-gray-600 text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                필터 적용
              </button>
              <button
                onClick={startAdvancedRandomInterview}
                disabled={isStarting}
                className="bg-blue-600 text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting ? '시작 중...' : '필터로 면접 시작'}
              </button>
            </div>
          </div>
        )}

        {/* 필터 */}
        <div className="bg-white rounded-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">필터</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/*TODO: 질문 검색 페이지 따로 만들어서 빼기*/}
            <div>
                  <label className="block text-xs text-gray-500 mb-1">검색</label>
                  <input
                      type="text"
                      placeholder="제목이나 내용으로 검색"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm text-black text-sm focus:outline-none focus:border-gray-400"
                  />
              </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">회사</label>
              <input
                type="text"
                placeholder="회사명"
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-black text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">연도</label>
              <input
                type="number"
                placeholder="연도"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-black text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">카테고리</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm text-black text-sm focus:outline-none focus:border-gray-400"
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category === '전체' ? '' : category}>
                    {category}
                  </option>
                ))}
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
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">질문을 불러오는 중입니다...</p>
            </div>
          ) : (
            questions.map((question) => (
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
          )))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">조건에 맞는 질문이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 북마크 폴더 선택 모달 */}
      {showBookmarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">북마크 폴더 선택</h3>
            <p className="text-sm text-gray-600 mb-4">질문을 어느 폴더에 북마크하시겠습니까?</p>
            
            <div className="space-y-2 mb-6">
              {Array.isArray(bookmarkFolders) && bookmarkFolders.map((folder) => (
                <button
                  key={folder.folderId}
                  onClick={() => addBookmarkToFolder(folder.folderId)}
                  disabled={isBookmarking}
                  className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{folder.name}</span>
                    <span className="text-sm text-gray-500">
                      {allBookmarks.find(fb => fb.folderId === folder.folderId)?.bookmarks?.length || 0}개
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBookmarkModal(false);
                  setSelectedQuestionForBookmark(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticePage;
