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
  const [questionCompany, setQuestionCompany] = useState('');
  const [questionYear, setQuestionYear] = useState('');
  const [questionCategory, setQuestionCategory] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
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
        
        const data = await questionService.searchAllQuestions(0, 100);
        console.log('Questions data from API:', data);
        
        // 안전하게 questions 배열 추출
        if (data && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        } else if (Array.isArray(data)) {
          // 만약 data가 직접 배열이라면
          setQuestions(data);
        } else {
          console.error('Unexpected data structure:', data);
          setQuestions([]);
        }
      } catch (error) {
        console.error('Load questions error:', error);
        setQuestions([]);
        // 에러 발생 시 사용자에게 알림
        alert('질문 목록을 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !questionCompany.trim() || !questionYear.trim() || !questionCategory.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 백엔드 API가 확장된 필드를 지원할 때까지 기본 q 필드만 전송
      await questionService.registerQuestions({
        questions: [{ 
          q: `${newQuestion} [${questionCompany}, ${questionYear}, ${questionCategory}]`
        }]
      } as question.RegisterQuestionRequest);
      
      // 폼 초기화
      setNewQuestion('');
      setQuestionCompany('');
      setQuestionYear('');
      setQuestionCategory('');
      setShowAddForm(false);
      
      // 목록 새로고침
      const data = await questionService.searchAllQuestions(0, 100);
      if (data && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else if (Array.isArray(data)) {
        setQuestions(data);
      }
      
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
      if (data && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else if (Array.isArray(data)) {
        setQuestions(data);
      }
      
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">질문 등록</h3>
            <p className="text-sm text-gray-500 mb-4">
              회사, 연도, 카테고리 정보는 질문 내용에 함께 저장됩니다.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  질문 내용 *
                </label>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="질문을 입력하세요..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회사 *
                  </label>
                  <input
                    type="text"
                    value={questionCompany}
                    onChange={(e) => setQuestionCompany(e.target.value)}
                    placeholder="예: 네이버, 카카오, 삼성..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연도 *
                  </label>
                  <input
                    type="number"
                    value={questionYear}
                    onChange={(e) => setQuestionYear(e.target.value)}
                    placeholder="예: 2024"
                    min="2000"
                    max="2030"
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 *
                  </label>
                  <select
                    value={questionCategory}
                    onChange={(e) => setQuestionCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
                  >
                    <option value="">카테고리 선택</option>
                    <option value="프론트엔드">프론트엔드</option>
                    <option value="백엔드">백엔드</option>
                    <option value="데이터베이스">데이터베이스</option>
                    <option value="네트워크">네트워크</option>
                    <option value="운영체제">운영체제</option>
                    <option value="자료구조">자료구조</option>
                    <option value="알고리즘">알고리즘</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
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
                  disabled={isSubmitting || !newQuestion.trim() || !questionCompany.trim() || !questionYear.trim() || !questionCategory.trim()}
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
                  className="w-full px-3 py-2 border border-gray-200 text-black rounded-sm text-sm focus:outline-none focus:border-gray-400"
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
