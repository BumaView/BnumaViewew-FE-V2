'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { bookmarkService } from '@/services/bookmarkService';
import { bookmark } from '@/types';
import { UserInfo } from '@/lib/types';

// 타입은 이미 types/bookmark.ts에 정의되어 있음

const BookmarksPage = () => {
  const [folders, setFolders] = useState<bookmark.GetBookmarkedFolderListResponse>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [selectedFolderBookmarks, setSelectedFolderBookmarks] = useState<bookmark.GetBookmarkedQuestionsInFolderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const router = useRouter();

  const loadBookmarkData = useCallback(async () => {
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
      console.log('Loading bookmark folders...');
      const response = await bookmarkService.getBookmarkFolders();
      console.log('Bookmark folders response:', response);
      
      // 백엔드 응답 구조에 따라 처리
      let foldersData: bookmark.GetBookmarkedFolderListResponse;
      if (Array.isArray(response)) {
        foldersData = response;
      } else if (response && 'content' in response) {
        foldersData = response.content;
      } else {
        console.error('Unexpected bookmarks response structure:', response);
        foldersData = [];
      }
      
      setFolders(foldersData);
    } catch (error) {
      console.error('Load data error:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadBookmarkData();
  }, [loadBookmarkData]);

  // 페이지 포커스 시 북마크 목록 다시 로드
  useEffect(() => {
    const handleFocus = () => {
      console.log('Page focused, reloading bookmarks...');
      loadBookmarkData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadBookmarkData]);

  const loadFolders = async () => {
    try {
      const foldersData = await bookmarkService.getBookmarkFolders();
      setFolders(foldersData);
    } catch (error) {
      console.error('Load folders error:', error);
    }
  };

  const loadFolderBookmarks = async (folderId: number) => {
    setIsLoadingBookmarks(true);
    try {
      console.log(`Loading bookmarks for folder ${folderId}...`);
      const bookmarksData = await bookmarkService.getBookmarkedQuestionsInFolder(folderId);
      console.log('Folder bookmarks response:', bookmarksData);
      setSelectedFolderBookmarks(bookmarksData);
    } catch (error) {
      console.error('Load folder bookmarks error:', error);
      setSelectedFolderBookmarks(null);
    } finally {
      setIsLoadingBookmarks(false);
    }
  };

  const createFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      // 토큰 확인
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        router.push('/login');
        return;
      }

      await bookmarkService.makeBookmarkedFolder({
        name: folderName.trim()
      });
      
      await loadFolders();
      setFolderName('');
      setShowCreateFolder(false);
    } catch (error: unknown) {
      console.error('Create folder error:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 403) {
          alert('백엔드 서버에 접근할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else if (axiosError.response?.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          router.push('/login');
        } else {
          alert('폴더 생성에 실패했습니다. 네트워크 연결을 확인해주세요.');
        }
      } else {
        alert('폴더 생성에 실패했습니다.');
      }
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const removeBookmark = async (bookmarkId: number) => {
    if (!confirm('이 북마크를 삭제하시겠습니까?')) return;

    try {
      console.log(`Removing bookmark ${bookmarkId}...`);
      await bookmarkService.unbookmarkingQuestion(bookmarkId);
      console.log('Bookmark removed successfully');
      
      // 북마크 제거 후 목록 다시 로드
      await loadBookmarkData();
      
      // 현재 선택된 폴더가 있다면 해당 폴더의 북마크들도 다시 로드
      if (selectedFolder !== null) {
        await loadFolderBookmarks(selectedFolder);
      }
    } catch (error: unknown) {
      console.error('Remove bookmark error:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 403) {
          alert('API 접근 권한이 없습니다. 로그인을 다시 시도해주세요.');
        } else if (axiosError.response?.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          router.push('/login');
        } else {
          alert('북마크 삭제에 실패했습니다. 네트워크 연결을 확인해주세요.');
        }
      } else {
        alert('북마크 삭제에 실패했습니다.');
      }
    }
  };

  const startInterviewWithBookmarks = async () => {
    const filteredBookmarks = getFilteredBookmarks();
    if (filteredBookmarks.length === 0) return;

    try {
      // 면접 세션 생성 로직은 practice 페이지에서 구현
      router.push('/practice');
    } catch (error) {
      console.error('Start interview error:', error);
    }
  };

  const getFilteredBookmarks = () => {
    if (selectedFolder === null) {
      // 전체 북마크: 모든 폴더의 북마크들을 합침
      if (Array.isArray(folders)) {
        return folders.flatMap(folder => folder.bookmarks || []);
      } else {
        return [];
      }
    } else {
      // 특정 폴더의 북마크: selectedFolderBookmarks에서 가져옴
      return selectedFolderBookmarks?.bookmarks || [];
    }
  };

  const getTotalBookmarkCount = () => {
    if (Array.isArray(folders)) {
      return folders.reduce((total, folder) => total + folder.bookmarks.length, 0);
    }
    return 0;
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

  const filteredBookmarks = getFilteredBookmarks();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-light text-gray-900 tracking-wide">
                BUMAVIEW
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  대시보드
                </Link>
                <Link href="/practice" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  면접 연습
                </Link>
                <span className="text-sm text-gray-900 font-medium">북마크</span>
                {userInfo?.userType === 'Admin' && (
                  <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                    관리자
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600 font-medium">
                  {userInfo?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* 사이드바 - 폴더 목록 */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-sm border border-gray-100 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium text-gray-900">폴더</h2>
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  + 새 폴더
                </button>
              </div>

              {/* 폴더 생성 폼 */}
              {showCreateFolder && (
                <form onSubmit={createFolder} className="mb-4 p-3 bg-gray-50 rounded-sm">
                  <input
                    type="text"
                    placeholder="폴더 이름"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    required
                    className="w-full px-2 py-1 border border-gray-200 rounded text-black text-sm mb-2 focus:outline-none focus:border-gray-400"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isCreatingFolder}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isCreatingFolder ? '생성 중...' : '생성'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateFolder(false);
                        setFolderName('');
                      }}
                      className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      취소
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedFolder(null);
                    setSelectedFolderBookmarks(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                    selectedFolder === null
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>전체 북마크</span>
                    <span className="text-xs text-gray-400">{getTotalBookmarkCount()}</span>
                  </div>
                </button>

                {Array.isArray(folders) && folders.map((folder) => (
                  <button
                    key={folder.folderId}
                    onClick={() => {
                      setSelectedFolder(folder.folderId);
                      loadFolderBookmarks(folder.folderId);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                      selectedFolder === folder.folderId
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{folder.name}</span>
                      <span className="text-xs text-gray-400">{folder.bookmarks?.length || 0}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-light text-gray-900 mb-2">
                  {selectedFolder === null 
                    ? '전체 북마크'
                    : Array.isArray(folders) 
                      ? folders.find(f => f.folderId === selectedFolder)?.name || '북마크'
                      : '북마크'
                  }
                </h1>
                <p className="text-gray-600">
                  {filteredBookmarks.length}개의 북마크된 질문
                </p>
              </div>
              {filteredBookmarks.length > 0 && (
                <button
                  onClick={startInterviewWithBookmarks}
                  className="bg-blue-600 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  이 북마크로 면접 시작 ({filteredBookmarks.length}개)
                </button>
              )}
            </div>

            {/* 북마크 목록 */}
            <div className="space-y-4">
              {isLoadingBookmarks ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">북마크를 불러오는 중...</p>
                </div>
              ) : (
                filteredBookmarks.map((bookmark) => (
                <div key={bookmark.bookmarkId} className="bg-white border border-gray-100 rounded-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {bookmark.question || (
                            <span className="text-gray-400 italic">
                              질문이 삭제되었거나 찾을 수 없습니다 (ID: {bookmark.questionId})
                            </span>
                          )}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <span className="text-xs text-gray-500">질문 ID: {bookmark.questionId}</span>
                          {!bookmark.question && (
                            <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                              삭제된 질문
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeBookmark(bookmark.bookmarkId)}
                          className="ml-4 text-sm text-red-600 hover:text-red-800 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>

            {!isLoadingBookmarks && filteredBookmarks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">
                  {selectedFolder === null 
                    ? '아직 북마크한 질문이 없습니다'
                    : '이 폴더에 북마크된 질문이 없습니다'
                  }
                </p>
                <Link href="/practice" className="text-blue-600 hover:text-blue-800 text-sm">
                  면접 연습에서 질문을 북마크해보세요
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage;
