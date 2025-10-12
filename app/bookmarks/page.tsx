'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BaseURL } from '@/lib/util';

interface Question {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  field: string;
  tags: string[];
}

interface Bookmark {
  id: number;
  userId: number;
  questionId: number;
  folderId?: number;
  createdAt: string;
  question: Question;
}

interface BookmarkFolder {
  id: number;
  userId: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  userId: number;
  name: string;
  userType: string;
  onboardingCompleted?: boolean;
}

const BookmarksPage = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
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

        await Promise.all([loadBookmarks(), loadFolders()]);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const loadBookmarks = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BaseURL}/api/bookmarks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.bookmarks);
      }
    } catch (error) {
      console.error('Load bookmarks error:', error);
    }
  };

  const loadFolders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BaseURL}/api/bookmarks/folders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders);
      }
    } catch (error) {
      console.error('Load folders error:', error);
    }
  };

  const createFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BaseURL}/api/bookmarks/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: folderName.trim(),
          description: folderDescription.trim() || undefined
        })
      });

      if (response.ok) {
        await loadFolders();
        setFolderName('');
        setFolderDescription('');
        setShowCreateFolder(false);
      } else {
        const error = await response.json();
        alert(error.message || '폴더 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Create folder error:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const removeBookmark = async (bookmarkId: number) => {
    if (!confirm('이 북마크를 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BaseURL}/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadBookmarks();
      } else {
        const error = await response.json();
        alert(error.message || '북마크 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Remove bookmark error:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const startInterviewWithBookmarks = async () => {
    const filteredBookmarks = getFilteredBookmarks();
    if (filteredBookmarks.length === 0) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BaseURL}/user/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionIds: filteredBookmarks.map(b => b.questionId)
        })
      });

      if (response.ok) {
        const sessionData = await response.json();
        router.push(`/practice/${sessionData.id}`);
      }
    } catch (error) {
      console.error('Start interview error:', error);
    }
  };

  const getFilteredBookmarks = () => {
    if (selectedFolder === null) {
      return bookmarks;
    }
    return bookmarks.filter(b => b.folderId === selectedFolder);
  };

  const getFolderBookmarkCount = (folderId: number) => {
    return bookmarks.filter(b => b.folderId === folderId).length;
  };

  const getUnfolderBookmarkCount = () => {
    return bookmarks.filter(b => !b.folderId).length;
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
                  {userInfo?.name.charAt(0)}
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
                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm mb-2 focus:outline-none focus:border-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="설명 (선택사항)"
                    value={folderDescription}
                    onChange={(e) => setFolderDescription(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm mb-2 focus:outline-none focus:border-gray-400"
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
                        setFolderDescription('');
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
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                    selectedFolder === null
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>전체 북마크</span>
                    <span className="text-xs text-gray-400">{bookmarks.length}</span>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedFolder(0)}
                  className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                    selectedFolder === 0
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>미분류</span>
                    <span className="text-xs text-gray-400">{getUnfolderBookmarkCount()}</span>
                  </div>
                </button>

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                      selectedFolder === folder.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{folder.name}</span>
                      <span className="text-xs text-gray-400">{getFolderBookmarkCount(folder.id)}</span>
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
                    : selectedFolder === 0 
                    ? '미분류 북마크'
                    : folders.find(f => f.id === selectedFolder)?.name || '북마크'
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
              {filteredBookmarks.map((bookmark) => (
                <div key={bookmark.id} className="bg-white border border-gray-100 rounded-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{bookmark.question.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(bookmark.question.difficulty)}`}>
                          {getDifficultyText(bookmark.question.difficulty)}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {bookmark.question.category}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                          {bookmark.question.field}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {bookmark.question.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {bookmark.question.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                          {bookmark.question.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{bookmark.question.tags.length - 3}</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(bookmark.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="ml-4 text-sm text-red-600 hover:text-red-800 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredBookmarks.length === 0 && (
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
