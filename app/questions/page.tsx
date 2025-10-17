'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { questionService } from '@/services/question.service';
import { Question, PaginatedResponse } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

export default function QuestionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchQuestions();
  }, [isAuthenticated, router]);


  const fetchQuestions = async (page = 0) => {
    try {
      setIsLoading(true);
      const response = await questionService.getQuestions({ 
        page, 
        size: 20 
      });
      setQuestions(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const response = await questionService.searchQuestions({
        category: categoryFilter || undefined,
        company: companyFilter || undefined,
        year: yearFilter ? parseInt(yearFilter) : undefined,
      });
      setQuestions(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(0);
    } catch (error) {
      console.error('Failed to search questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = async (questionId: number) => {
    try {
      const question = await questionService.getQuestionById(questionId);
      setSelectedQuestion(question);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to fetch question details:', error);
      alert('문제 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const handlePageChange = (page: number) => {
    fetchQuestions(page);
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
        <h1 className="text-3xl font-bold text-gray-900">질문 목록</h1>
        <p className="text-gray-600">등록된 면접 질문들을 확인하고 상세 정보를 볼 수 있습니다.</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체</option>
                <option value="back">백엔드</option>
                <option value="front">프론트엔드</option>
                <option value="ai">AI</option>
                <option value="bank">은행</option>
                <option value="game">게임</option>
                <option value="design">디자인</option>
                <option value="security">보안</option>
                <option value="infra">인프라</option>
                <option value="embedded">임베디드</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                회사
              </label>
              <Input
                placeholder="회사명 입력"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연도
              </label>
              <Input
                placeholder="연도 입력 (예: 2023)"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleSearch} className="flex-1">
              필터 적용
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCategoryFilter('');
                setCompanyFilter('');
                setYearFilter('');
                fetchQuestions(0);
              }}
            >
              초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>질문 목록 ({questions.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questions.map((question) => (
              <div
                key={question.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleQuestionClick(question.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2 line-clamp-2">{question.question}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {question.category}
                      </span>
                      <span>{question.company}</span>
                      <span>•</span>
                      <span>{question.year}</span>
                      {question.tag && (
                        <>
                          <span>•</span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {question.tag}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    상세보기
                  </Button>
                </div>
              </div>
            ))}
          </div>

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
              <span className="text-sm text-gray-600">
                {currentPage + 1} / {totalPages}
              </span>
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

      {/* Question Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="문제 상세 정보"
        size="lg"
      >
        {selectedQuestion && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">문제</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedQuestion.question}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">카테고리</h4>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {selectedQuestion.category}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">회사</h4>
                <p className="text-gray-600">{selectedQuestion.company}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">연도</h4>
                <p className="text-gray-600">{selectedQuestion.year}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">태그</h4>
                <p className="text-gray-600">{selectedQuestion.tag || '없음'}</p>
              </div>
            </div>

            {selectedQuestion.field && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">분야</h4>
                <p className="text-gray-600">{selectedQuestion.field}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
                className="flex-1"
              >
                닫기
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
