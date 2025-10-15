'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { questionService } from '@/services/questionService';
import { question } from '@/types';
import { UserInfo } from '@/lib/types';

const AdminPage = () => {
  const [questions, setQuestions] = useState<question.Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUserInfo = localStorage.getItem('userInfo');

      if (!token || !storedUserInfo) {
        router.push('/login');
        return;
      }

      const parsedUserInfo = JSON.parse(storedUserInfo);
      if (parsedUserInfo.userType !== 'ADMIN') {
        alert('관리자 권한이 필요합니다.');
        router.push('/dashboard');
        return;
      }

      setUserInfo(parsedUserInfo);
      
      try {
        const data = await questionService.searchAllQuestions(0, 100);
        setQuestions(data.questions);
      } catch (error) {
        console.error('Load questions error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;

    setIsSubmitting(true);
    try {
      await questionService.registerQuestions({
        questions: [{ q: newQuestion }]
      });
      
      setNewQuestion('');
      setShowAddForm(false);
      
      // 목록 새로고침
      const data = await questionService.searchAllQuestions(0, 100);
      setQuestions(data.questions);
      
      alert('질문이 등록되었습니다.');
    } catch (error) {
      console.error('Add question error:', error);
      alert('질문 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!googleSheetUrl.trim()) return;

    setIsSubmitting(true);
    try {
      await questionService.registerMultipleQuestions({
        googleSheetUrl
      });
      
      setGoogleSheetUrl('');
      setShowBulkForm(false);
      
      // 목록 새로고침
      const data = await questionService.searchAllQuestions(0, 100);
      setQuestions(data.questions);
      
      alert('일괄 등록이 완료되었습니다.');
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('일괄 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await questionService.deleteQuestion(questionId);
      
      // 목록 새로고침
      const data = await questionService.searchAllQuestions(0, 100);
      setQuestions(data.questions);
      
      alert('질문이 삭제되었습니다.');
    } catch (error) {
      console.error('Delete question error:', error);
      alert('질문 삭제에 실패했습니다.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) return;
    if (!confirm(`선택한 ${selectedQuestions.length}개 질문을 삭제하시겠습니까?`)) return;

    try {
      await questionService.deleteMultipleQuestions(selectedQuestions);
      
      setSelectedQuestions([]);
      
      // 목록 새로고침
      const data = await questionService.searchAllQuestions(0, 100);
      setQuestions(data.questions);
      
      alert('선택한 질문들이 삭제되었습니다.');
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('일괄 삭제에 실패했습니다.');
    }
  };

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
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
      <Header userInfo={userInfo} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-gray-900 mb-2">관리자 페이지</h1>
          <p className="text-gray-600">질문을 등록, 수정, 삭제할 수 있습니다.</p>
        </div>

        {/* 액션 버튼들 */}
        <div className="bg-white rounded-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {showAddForm ? '취소' : '질문 등록'}
            </button>
            <button
              onClick={() => setShowBulkForm(!showBulkForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {showBulkForm ? '취소' : '일괄 등록'}
            </button>
            {selectedQuestions.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-red-700 transition-colors"
              >
                선택 삭제 ({selectedQuestions.length})
              </button>
            )}
          </div>
        </div>

        {/* 질문 등록 폼 */}
        {showAddForm && (
          <div className="bg-white rounded-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">질문 등록</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  질문 내용
                </label>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="질문을 입력하세요..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAddQuestion}
                  disabled={isSubmitting || !newQuestion.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '등록 중...' : '등록'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 일괄 등록 폼 */}
        {showBulkForm && (
          <div className="bg-white rounded-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Google Sheets 일괄 등록</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Sheets URL
                </label>
                <input
                  type="url"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowBulkForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleBulkUpload}
                  disabled={isSubmitting || !googleSheetUrl.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '등록 중...' : '일괄 등록'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 질문 목록 */}
        <div className="bg-white rounded-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">질문 목록 ({questions.length}개)</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {questions.map((question) => (
              <div key={question.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => toggleQuestionSelection(question.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-500">ID: {question.id}</span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {question.category}
                      </span>
                      {question.company && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                          {question.company}
                        </span>
                      )}
                      {question.year && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                          {question.year}년
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900">{question.question}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-800 text-sm transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {questions.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              등록된 질문이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
