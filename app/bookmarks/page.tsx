'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { bookmarkService } from '@/services/bookmark.service';
import { questionService } from '@/services/question.service';
import { BookmarkFolder, Question } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

export default function BookmarksPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<BookmarkFolder | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestionForBookmark, setSelectedQuestionForBookmark] = useState<Question | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchFolders();
    fetchQuestions();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = questions.filter(q =>
        (q.question?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (q.company?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (q.category?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions(questions);
    }
  }, [searchQuery, questions]);

  const fetchFolders = async () => {
    try {
      const response = await bookmarkService.getBookmarkList();
      setFolders(response);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const handleFolderClick = async (folder: BookmarkFolder) => {
    try {
      // 개별 폴더 조회 API 호출
      const folderDetails = await bookmarkService.getFolderContents(folder.folderId);
      setSelectedFolder(folderDetails);
    } catch (error) {
      console.error('Failed to fetch folder contents:', error);
      // API 호출 실패 시 기존 폴더 정보 사용
      setSelectedFolder(folder);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await questionService.getQuestions({ page: 0, size: 100 });
      setQuestions(response.content);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert('폴더 이름을 입력해주세요.');
      return;
    }

    try {
      await bookmarkService.createFolder({ name: newFolderName });
      setNewFolderName('');
      setShowCreateFolderModal(false);
      fetchFolders();
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert('폴더 생성에 실패했습니다.');
    }
  };

  const handleBookmarkQuestion = async (questionId: number, folderId: number) => {
    try {
      await bookmarkService.bookmarkQuestion({ questionId, folderId });
      alert('북마크에 추가되었습니다.');
      fetchFolders();
    } catch (error) {
      console.error('Failed to bookmark question:', error);
      alert('북마크 추가에 실패했습니다.');
    }
  };

  const handleUnbookmarkQuestion = async (bookmarkId: number) => {
    try {
      await bookmarkService.unbookmarkQuestion(bookmarkId);
      alert('북마크에서 제거되었습니다.');
      fetchFolders();
    } catch (error) {
      console.error('Failed to unbookmark question:', error);
      alert('북마크 제거에 실패했습니다.');
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    if (!confirm('폴더를 삭제하시겠습니까?')) return;

    try {
      await bookmarkService.deleteFolder(folderId);
      fetchFolders();
      if (selectedFolder?.folderId === folderId) {
        setSelectedFolder(null);
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
      alert('폴더 삭제에 실패했습니다.');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">북마크 관리</h1>
        <Button onClick={() => setShowCreateFolderModal(true)}>
          새 폴더 만들기
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folders Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>폴더 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {folders.map((folder) => (
                  <div
                    key={folder.folderId}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedFolder?.folderId === folder.folderId
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleFolderClick(folder)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{folder.name}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.folderId);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {selectedFolder ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedFolder.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFolder.bookmarks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    이 폴더에 북마크된 문제가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedFolder.bookmarks.map((bookmark) => (
                      <div
                        key={bookmark.bookmarkId}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <p className="text-gray-900 mb-2">{bookmark.question}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            ID: {bookmark.questionId}
                          </span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUnbookmarkQuestion(bookmark.bookmarkId)}
                          >
                            북마크 해제
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">폴더를 선택하거나 새 폴더를 만들어보세요.</p>
                <Button onClick={() => setShowCreateFolderModal(true)}>
                  새 폴더 만들기
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Question Search */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>문제 검색 및 북마크</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="문제 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <p className="text-gray-900 mb-2">{question.question}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{question.company} • {question.category} • {question.year}</span>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedQuestionForBookmark(question);
                            setShowBookmarkModal(true);
                          }}
                        >
                          북마크
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Folder Modal */}
      <Modal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        title="새 폴더 만들기"
      >
        <div className="space-y-4">
          <Input
            label="폴더 이름"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="폴더 이름을 입력하세요"
          />
          <div className="flex space-x-3">
            <Button onClick={handleCreateFolder} className="flex-1">
              만들기
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateFolderModal(false)}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bookmark Modal */}
      <Modal
        isOpen={showBookmarkModal}
        onClose={() => setShowBookmarkModal(false)}
        title="북마크 추가"
      >
        <div className="space-y-4">
          {selectedQuestionForBookmark && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">선택한 문제:</p>
              <p className="text-gray-900">{selectedQuestionForBookmark.question}</p>
            </div>
          )}
          <p className="text-gray-600">어떤 폴더에 추가하시겠습니까?</p>
          <div className="space-y-2">
            {folders.map((folder) => (
              <button
                key={folder.folderId}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={async () => {
                  if (selectedQuestionForBookmark) {
                    await handleBookmarkQuestion(selectedQuestionForBookmark.id, folder.folderId);
                    setShowBookmarkModal(false);
                    setSelectedQuestionForBookmark(null);
                  }
                }}
              >
                {folder.name}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}