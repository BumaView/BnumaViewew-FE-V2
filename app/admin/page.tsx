'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { questionService } from '@/services/question.service';
import { Question } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // 캐시 상태
  const [questionsCache, setQuestionsCache] = useState<{[key: number]: Question[]}>({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5분
  
  // 인증 복원 상태
  const [isAuthRestoring, setIsAuthRestoring] = useState(true);

  // Form states
  const [questionForm, setQuestionForm] = useState({
    q: '',
  });
  const [bulkForm, setBulkForm] = useState({
    googleSheetUrl: '',
  });

  useEffect(() => {
    console.log('=== ADMIN PAGE DEBUG ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('userType:', user?.userType);
    console.log('userId:', user?.userId);
    console.log('accessToken exists:', !!localStorage.getItem('accessToken'));
    console.log('isAuthRestoring:', isAuthRestoring);
    console.log('========================');
    
    // JWT 토큰이 있는지 먼저 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No token found, redirecting to login');
      setIsAuthRestoring(false);
      router.push('/login');
      return;
    }

    // 토큰이 있지만 사용자 정보가 없는 경우 (새로고침 등)
    if (!user) {
      console.log('Token exists but no user info, waiting for auth restoration...');
      // 인증 복원을 기다리는 동안 로딩 상태 유지
      return;
    }

    // 사용자 정보가 있지만 ADMIN이 아닌 경우
    if (user.userType !== 'ADMIN') {
      console.log('User is not ADMIN, redirecting to login');
      setIsAuthRestoring(false);
      router.push('/login');
      return;
    }

    // 모든 조건을 만족하면 데이터 로드
    console.log('All conditions met, loading data...');
    setIsAuthRestoring(false);
    
    // 캐시에서 로드 시도, 실패하면 API 호출
    const cacheLoaded = loadFromCache();
    if (!cacheLoaded) {
      console.log('Cache not available, fetching from API...');
      fetchQuestions(0, true);
    }
  }, [isAuthenticated, user, router]);

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

  // 캐시에서 데이터 로드
  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem('adminQuestionsCache');
      const cachedTimestamp = localStorage.getItem('adminQuestionsCacheTimestamp');
      
      if (cached && cachedTimestamp) {
        const data = JSON.parse(cached);
        const timestamp = parseInt(cachedTimestamp);
        
        // 캐시가 유효한지 확인 (5분)
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log('Loading from cache...');
          setQuestionsCache(data.questionsCache);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
          
          // 첫 페이지 데이터 설정 (빈 배열이어도 설정)
          setQuestions(data.questionsCache[0] || []);
          setCurrentPage(0);
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to load from cache:', error);
    }
    return false;
  };

  // 캐시에 데이터 저장
  const saveToCache = (questionsCache: {[key: number]: Question[]}, totalPages: number, totalElements: number) => {
    try {
      const cacheData = {
        questionsCache,
        totalPages,
        totalElements
      };
      localStorage.setItem('adminQuestionsCache', JSON.stringify(cacheData));
      localStorage.setItem('adminQuestionsCacheTimestamp', Date.now().toString());
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  };

  const fetchQuestions = async (page = 0, forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      // 캐시에서 먼저 확인 (강제 새로고침이 아닌 경우)
      if (!forceRefresh && questionsCache[page]) {
        console.log(`Loading page ${page} from cache`);
        setQuestions(questionsCache[page]);
        setCurrentPage(page);
        setIsLoading(false);
        return;
      }
      
      console.log(`Fetching page ${page} from API`);
      const response = await questionService.getQuestions({ page, size: 10 });
      
      // 캐시 업데이트
      const newCache = { ...questionsCache, [page]: response.content };
      setQuestionsCache(newCache);
      setQuestions(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(page);
      
      // 캐시 저장
      saveToCache(newCache, response.totalPages, response.totalElements);
      
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      // 에러 발생 시 빈 배열로 설정하여 무한로딩 방지
      setQuestions([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!questionForm.q.trim()) {
      alert('문제를 입력해주세요.');
      return;
    }

    try {
      await questionService.registerQuestion({
        questions: [{ q: questionForm.q }]
      });
      setQuestionForm({ q: '' });
      setShowCreateModal(false);
      // 캐시 무효화하고 새로고침
      localStorage.removeItem('adminQuestionsCache');
      localStorage.removeItem('adminQuestionsCacheTimestamp');
      fetchQuestions(0, true);
      alert('문제가 등록되었습니다.');
    } catch (error) {
      console.error('Failed to create question:', error);
      alert('문제 등록에 실패했습니다.');
    }
  };

  const handleEditQuestion = async () => {
    if (!selectedQuestion || !questionForm.q.trim()) {
      alert('문제를 입력해주세요.');
      return;
    }

    try {
      console.log('Editing question:', selectedQuestion.id, questionForm);
      const response = await questionService.editQuestion(selectedQuestion.id, questionForm);
      console.log('Edit response:', response);
      setShowEditModal(false);
      setSelectedQuestion(null);
      setQuestionForm({ q: '' });
      // 캐시 무효화하고 새로고침
      localStorage.removeItem('adminQuestionsCache');
      localStorage.removeItem('adminQuestionsCacheTimestamp');
      fetchQuestions(currentPage, true);
      alert('문제가 수정되었습니다.');
    } catch (error) {
      console.error('Failed to edit question:', error);
      alert(`문제 수정에 실패했습니다: ${(error as Error)?.message || error}`);
    }
  };

  const handleBulkCreate = async () => {
    if (!bulkForm.googleSheetUrl.trim()) {
      alert('Google Sheets URL을 입력해주세요.');
      return;
    }

    try {
      await questionService.registerMultipleQuestions(bulkForm);
      setBulkForm({ googleSheetUrl: '' });
      setShowBulkModal(false);
      // 캐시 무효화하고 새로고침
      localStorage.removeItem('adminQuestionsCache');
      localStorage.removeItem('adminQuestionsCacheTimestamp');
      fetchQuestions(0, true);
      alert('문제 일괄 등록이 완료되었습니다.');
    } catch (error) {
      console.error('Failed to bulk create questions:', error);
      alert('문제 일괄 등록에 실패했습니다.');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('이 문제를 삭제하시겠습니까?')) return;

    try {
      console.log('Deleting question:', questionId);
      console.log('Current user:', user);
      console.log('Access token:', localStorage.getItem('accessToken'));
      const response = await questionService.deleteQuestion(questionId);
      console.log('Delete response:', response);
      // 캐시 무효화하고 새로고침
      localStorage.removeItem('adminQuestionsCache');
      localStorage.removeItem('adminQuestionsCacheTimestamp');
      fetchQuestions(currentPage, true);
      alert(`문제 ID ${response.id}가 삭제되었습니다.`);
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert(`문제 삭제에 실패했습니다: ${(error as Error)?.message || error}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      alert('삭제할 문제를 선택해주세요.');
      return;
    }

    if (!confirm(`${selectedQuestions.length}개의 문제를 삭제하시겠습니까?`)) return;

    try {
      const response = await questionService.deleteMultipleQuestions({ questionIds: selectedQuestions });
      setSelectedQuestions([]);
      // 캐시 무효화하고 새로고침
      localStorage.removeItem('adminQuestionsCache');
      localStorage.removeItem('adminQuestionsCacheTimestamp');
      fetchQuestions(currentPage, true);
      alert(`선택한 ${response.ids.length}개의 문제가 삭제되었습니다.`);
    } catch (error) {
      console.error('Failed to bulk delete questions:', error);
      alert('문제 일괄 삭제에 실패했습니다.');
    }
  };

  const handleQuestionSelect = (questionId: number) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    }
  };

  const handlePageChange = (page: number) => {
    fetchQuestions(page);
  };

  // 인증 복원 중이거나 로딩 중일 때
  if (isAuthRestoring || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">
            {isAuthRestoring ? '인증 정보를 확인하는 중...' : '데이터를 불러오는 중...'}
          </p>
        </div>
      </div>
    );
  }

  // 인증되지 않았거나 ADMIN이 아닌 경우
  if (!isAuthenticated || user?.userType !== 'ADMIN') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 페이지</h1>
        <div className="flex space-x-3">
          <Button onClick={() => setShowCreateModal(true)}>
            문제 등록
          </Button>
          <Button variant="outline" onClick={() => setShowBulkModal(true)}>
            일괄 등록
          </Button>
        </div>
              </div>
              
      {/* Search and Actions */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Input
              placeholder="문제 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleSelectAll}
              >
                {selectedQuestions.length === filteredQuestions.length ? '전체 해제' : '전체 선택'}
              </Button>
              {selectedQuestions.length > 0 && (
                <Button
                  variant="danger"
                  onClick={handleBulkDelete}
                >
                  선택 삭제 ({selectedQuestions.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>문제 목록 ({totalElements}개)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 질문이 없습니다</h3>
              <p className="text-gray-500 mb-6">첫 번째 질문을 등록해보세요!</p>
              <Button onClick={() => setShowCreateModal(true)}>
                질문 등록하기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className={`p-4 border rounded-lg ${
                    selectedQuestions.includes(question.id)
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                      onChange={() => handleQuestionSelect(question.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{question.question}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{question.company}</span>
                        <span>•</span>
                        <span>{question.category}</span>
                        <span>•</span>
                        <span>{question.year}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedQuestion(question);
                          setQuestionForm({ q: question.question });
                          setShowEditModal(true);
                        }}
                      >
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                이전
              </Button>
              
              {/* 페이지 번호들 */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Question Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="문제 등록"
      >
        <div className="space-y-4">
          <Input
            label="문제"
            value={questionForm.q}
            onChange={(e) => setQuestionForm({ q: e.target.value })}
            placeholder="문제를 입력하세요"
          />
          <div className="flex space-x-3">
            <Button onClick={handleCreateQuestion} className="flex-1">
              등록
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Question Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="문제 수정"
      >
        <div className="space-y-4">
          <Input
            label="문제"
            value={questionForm.q}
            onChange={(e) => setQuestionForm({ q: e.target.value })}
            placeholder="문제를 입력하세요"
          />
          <div className="flex space-x-3">
            <Button onClick={handleEditQuestion} className="flex-1">
              수정
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="flex-1"
            >
              취소
            </Button>
            </div>
        </div>
      </Modal>

      {/* Bulk Create Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="문제 일괄 등록"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Sheets URL
            </label>
            <Input
              value={bulkForm.googleSheetUrl}
              onChange={(e) => setBulkForm({ googleSheetUrl: e.target.value })}
              placeholder="https://docs.google.com/spreadsheets/..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Google Sheets의 첫 번째 열에 문제를 입력하세요.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleBulkCreate} className="flex-1">
              일괄 등록
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowBulkModal(false)}
              className="flex-1"
            >
              취소
            </Button>
        </div>
      </div>
      </Modal>
    </div>
  );
}