'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { UserInfo } from '@/lib/types';
import * as XLSX from 'xlsx';
import { BaseURL } from '@/lib/util';

interface Question {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  field: string;
  company?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const AdminPage = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '기술면접',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    field: '',
    company: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    field: '',
    difficulty: '',
    category: ''
  });
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors?: { index: number; error: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const checkAdminAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    const storedUserInfo = localStorage.getItem('userInfo');

    if (!token || !storedUserInfo) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${BaseURL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        if (parsedUserInfo.userType !== 'Admin') {
          router.push('/dashboard');
          return;
        }
        setUserInfo(parsedUserInfo);
      } else {
        localStorage.clear();
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const loadQuestions = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.field) queryParams.append('field', filters.field);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.category) queryParams.append('category', filters.category);

      const response = await fetch(`${BaseURL}/admin/questions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Load questions error:', error);
    }
  }, [filters]);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  useEffect(() => {
    if (userInfo) {
      loadQuestions();
    }
  }, [userInfo, loadQuestions]);

  const handleFormChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const url = editingQuestion 
        ? `${BaseURL}/admin/questions/${editingQuestion.id}`
        : `${BaseURL}/admin/questions`;
      const method = editingQuestion ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadQuestions();
        resetForm();
        setShowCreateForm(false);
        setEditingQuestion(null);
      } else {
        const error = await response.json();
        alert(error.message || '오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: '기술면접',
      difficulty: 'medium',
      field: '',
      company: '',
      tags: []
    });
    setTagInput('');
  };

  const startEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      content: question.content,
      category: question.category,
      difficulty: question.difficulty,
      field: question.field,
      company: question.company || '',
      tags: [...question.tags]
    });
    setShowCreateForm(true);
  };

  const deleteQuestion = async (questionId: number) => {
    if (!confirm('정말 이 질문을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BaseURL}/admin/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadQuestions();
      } else {
        const error = await response.json();
        alert(error.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const deleteSelectedQuestions = async () => {
    if (selectedQuestions.length === 0) return;
    if (!confirm(`선택한 ${selectedQuestions.length}개의 질문을 삭제하시겠습니까?`)) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BaseURL}/admin/questions/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ questionIds: selectedQuestions })
      });

      if (response.ok) {
        setSelectedQuestions([]);
        await loadQuestions();
      } else {
        const error = await response.json();
        alert(error.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
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

  // Excel 파일 처리
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const questions = (jsonData as { [key: string]: string }[]).map((row) => ({
        title: row['제목'] || row['title'] || '',
        content: row['내용'] || row['content'] || '',
        category: row['카테고리'] || row['category'] || '기술면접',
        difficulty: row['난이도'] || row['difficulty'] || 'medium',
        field: row['분야'] || row['field'] || '',
        tags: (row['태그'] || row['tags'] || '').split(',').map((tag: string) => tag.trim()).filter(Boolean)
      }));

      await bulkCreateQuestions(questions);
    } catch (error) {
      console.error('File processing error:', error);
      alert('파일 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Google Sheets URL 처리
  const handleSheetsImport = async () => {
    if (!sheetsUrl.trim()) {
      alert('Google Sheets URL을 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    try {
      // Google Sheets URL을 CSV 형태로 변환
      let csvUrl = sheetsUrl;
      if (sheetsUrl.includes('/edit')) {
        csvUrl = sheetsUrl.replace('/edit#gid=', '/export?format=csv&gid=').replace('/edit', '/export?format=csv');
      }

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Google Sheets에 접근할 수 없습니다. 공개 설정을 확인해주세요.');
      }

      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const questions = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const row: { [key: string]: string } = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        return {
          title: row['제목'] || row['title'] || '',
          content: row['내용'] || row['content'] || '',
          category: row['카테고리'] || row['category'] || '기술면접',
          difficulty: row['난이도'] || row['difficulty'] || 'medium',
          field: row['분야'] || row['field'] || '',
          tags: (row['태그'] || row['tags'] || '').split(',').map((tag: string) => tag.trim()).filter(Boolean)
        };
      }).filter(q => q.title && q.content);

      await bulkCreateQuestions(questions);
    } catch (error) {
      console.error('Sheets import error:', error);
      alert('Google Sheets 가져오기 중 오류가 발생했습니다. URL이 공개로 설정되어 있는지 확인해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 대량 질문 생성
  const bulkCreateQuestions = async (questions: Array<{ title: string; content: string; category: string; difficulty: string; field: string; tags: string[] }>) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${BaseURL}/admin/questions/sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ questions })
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadResult(result);
        await loadQuestions();
        alert(`성공: ${result.success}개, 실패: ${result.failed}개`);
      } else {
        alert(result.message || '업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Bulk create error:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const resetBulkUpload = () => {
    setShowBulkUpload(false);
    setSheetsUrl('');
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-light text-gray-900 mb-2">질문 관리</h1>
            <p className="text-gray-600">면접 질문을 등록, 수정, 삭제할 수 있습니다.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowBulkUpload(true)}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-sm text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              대량 업로드
            </button>
            <button
              onClick={() => {
                resetForm();
                setEditingQuestion(null);
                setShowCreateForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              새 질문 추가
            </button>
          </div>
        </div>

        {/* 대량 업로드 모달 */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-sm border border-gray-100 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-light text-gray-900 mb-4">대량 질문 업로드</h2>
              
              <div className="space-y-6">
                {/* 템플릿 다운로드 */}
                <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">📋 템플릿 형식</h3>
                  <p className="text-xs text-blue-700 mb-3">
                    Excel 파일이나 Google Sheets에서 다음 열 이름을 사용해주세요:
                  </p>
                  <div className="bg-white rounded border p-3 text-xs font-mono">
                    <div className="grid grid-cols-3 gap-2">
                      <span>제목 (title)</span>
                      <span>내용 (content)</span>
                      <span>분야 (field)</span>
                      <span>카테고리 (category)</span>
                      <span>난이도 (difficulty)</span>
                      <span>태그 (tags)</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    * 난이도: easy, medium, hard 중 하나<br/>
                    * 카테고리: 기술면접, 인성면접 중 하나<br/>
                    * 태그: 쉼표로 구분 (예: React, JavaScript, 프론트엔드)
                  </p>
                </div>

                {/* Excel 파일 업로드 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">📁 Excel 파일 업로드</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-sm text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? '처리 중...' : '파일 선택'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      .xlsx, .xls, .csv 파일 지원
                    </p>
                  </div>
                </div>

                {/* 구분선 */}
                <div className="flex items-center">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="px-4 text-xs text-gray-400">또는</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Google Sheets URL */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">🔗 Google Sheets 링크</h3>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3">
                      <p className="text-xs text-yellow-800">
                        ⚠️ Google Sheets는 반드시 <strong>&ldquo;링크가 있는 모든 사용자&rdquo;</strong>로 공개 설정해주세요.
                      </p>
                    </div>
                    <input
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={sheetsUrl}
                      onChange={(e) => setSheetsUrl(e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
                    />
                    <button
                      onClick={handleSheetsImport}
                      disabled={!sheetsUrl.trim() || isProcessing}
                      className="bg-green-600 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? '가져오는 중...' : 'Google Sheets 가져오기'}
                    </button>
                  </div>
                </div>

                {/* 업로드 결과 */}
                {uploadResult && (
                  <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">업로드 결과</h3>
                    <div className="text-xs space-y-1">
                      <div className="text-green-600">✅ 성공: {uploadResult.success}개</div>
                      <div className="text-red-600">❌ 실패: {uploadResult.failed}개</div>
                      {uploadResult.errors && uploadResult.errors.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-red-600">오류 상세보기</summary>
                          <div className="mt-2 max-h-32 overflow-y-auto">
                            {uploadResult.errors.map((error: { index: number; error: string }, index: number) => (
                              <div key={index} className="text-red-600 text-xs">
                                행 {error.index + 1}: {error.error}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={resetBulkUpload}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-sm text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 질문 생성/수정 폼 */}
        {showCreateForm && (
          <div className="bg-white rounded-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-light text-gray-900 mb-4">
              {editingQuestion ? '질문 수정' : '새 질문 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">분야</label>
                  <select
                    value={formData.field}
                    onChange={(e) => handleFormChange('field', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400 text-gray-500"
                  >
                    <option value="" className="text-gray-500">선택해주세요</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">회사</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleFormChange('company', e.target.value)}
                    placeholder="예: 카카오, 네이버, 토스 (선택사항)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400 text-gray-500 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400 text-gray-500"
                  >
                    <option value="기술면접">기술면접</option>
                    <option value="인성면접">인성면접</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleFormChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400 text-gray-500"
                  >
                    <option value="easy">쉬움</option>
                    <option value="medium">보통</option>
                    <option value="hard">어려움</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">질문 내용</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleFormChange('content', e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">태그</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())
                    }
                    placeholder="태그를 입력하고 엔터를 누르세요"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-sm text-sm hover:bg-gray-200"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingQuestion(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-sm text-sm hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? '저장 중...' : (editingQuestion ? '수정' : '추가')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="제목이나 내용으로 검색"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400 placeholder-gray-500"
            />
            <select
              value={filters.field}
              onChange={(e) => setFilters(prev => ({ ...prev, field: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400 text-gray-500"
            >
              <option value="" className="text-gray-500">모든 분야</option>
              <option value="프론트엔드 개발">프론트엔드</option>
              <option value="백엔드 개발">백엔드</option>
              <option value="공통">공통</option>
            </select>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400 text-gray-500"
            >
              <option value="" className="text-gray-500">모든 난이도</option>
              <option value="easy">쉬움</option>
              <option value="medium">보통</option>
              <option value="hard">어려움</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400 text-gray-500"
            >
              <option value="" className="text-gray-500">모든 카테고리</option>
              <option value="기술면접">기술면접</option>
              <option value="인성면접">인성면접</option>
            </select>
          </div>
        </div>

        {/* 선택 컨트롤 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">총 {questions.length}개 질문</span>
            {selectedQuestions.length > 0 && (
              <span className="text-sm text-blue-600">{selectedQuestions.length}개 선택됨</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {selectedQuestions.length > 0 && (
              <button
                onClick={deleteSelectedQuestions}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                선택한 질문 삭제
              </button>
            )}
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
              className={`bg-white border rounded-sm p-6 ${
                selectedQuestions.includes(question.id)
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question.id)}
                    onChange={() => toggleQuestionSelection(question.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{question.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(question.difficulty)}`}>
                        {getDifficultyText(question.difficulty)}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {question.category}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                        {question.field}
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
                    <div className="flex gap-2 flex-wrap">
                      {question.tags.map((tag, index) => (
                        <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(question)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => deleteQuestion(question.id)}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    삭제
                  </button>
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

export default AdminPage;
