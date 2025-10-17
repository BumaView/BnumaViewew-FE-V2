'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { UserInfo } from '@/lib/types';

interface Material {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'video' | 'article' | 'document' | 'practice';
  duration?: string;
  url?: string;
  tags: string[];
}

const MaterialsPage = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const router = useRouter();

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'back', label: '백엔드' },
    { value: 'front', label: '프론트엔드' },
    { value: 'ai', label: 'AI' },
    { value: 'bank', label: '은행' },
    { value: 'game', label: '게임' },
    { value: 'design', label: '디자인' },
    { value: 'security', label: '보안' },
    { value: 'infra', label: '인프라' },
    { value: 'embedded', label: '임베디드' }
  ];

  const difficulties = [
    { value: 'all', label: '전체' },
    { value: 'beginner', label: '초급' },
    { value: 'intermediate', label: '중급' },
    { value: 'advanced', label: '고급' }
  ];

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUserInfo = localStorage.getItem('userInfo');

      if (!token || !storedUserInfo) {
        router.push('/login');
        return;
      }

      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);

        // 임시 학습 자료 데이터
        const mockMaterials: Material[] = [
          {
            id: 1,
            title: 'React 완벽 가이드',
            description: 'React의 기본 개념부터 고급 패턴까지 체계적으로 학습할 수 있는 가이드입니다.',
            category: 'front',
            difficulty: 'intermediate',
            type: 'article',
            duration: '2시간',
            url: 'https://react.dev/learn',
            tags: ['React', 'JavaScript', '컴포넌트']
          },
          {
            id: 2,
            title: 'Node.js 백엔드 개발',
            description: 'Node.js를 사용한 서버 개발과 API 설계에 대한 실무 강의입니다.',
            category: 'back',
            difficulty: 'intermediate',
            type: 'video',
            duration: '4시간',
            url: 'https://youtube.com/playlist',
            tags: ['Node.js', 'Express', 'API']
          },
          {
            id: 3,
            title: '데이터베이스 설계 원리',
            description: '관계형 데이터베이스 설계와 정규화에 대한 이론과 실습 자료입니다.',
            category: 'back',
            difficulty: 'advanced',
            type: 'document',
            duration: '3시간',
            url: 'https://docs.example.com',
            tags: ['MySQL', 'PostgreSQL', '정규화']
          },
          {
            id: 4,
            title: '알고리즘 문제 해결 전략',
            description: '코딩 테스트를 위한 알고리즘 문제 해결 방법과 패턴을 학습합니다.',
            category: 'ai',
            difficulty: 'intermediate',
            type: 'practice',
            duration: '5시간',
            url: 'https://leetcode.com',
            tags: ['알고리즘', '자료구조', '코딩테스트']
          },
          {
            id: 5,
            title: '시스템 설계 면접 준비',
            description: '대규모 시스템 설계 면접을 위한 핵심 개념과 설계 패턴을 다룹니다.',
            category: 'infra',
            difficulty: 'advanced',
            type: 'video',
            duration: '6시간',
            url: 'https://youtube.com/system-design',
            tags: ['시스템설계', '확장성', '분산시스템']
          },
          {
            id: 6,
            title: '면접 질문 모음집',
            description: '실제 면접에서 자주 나오는 질문들과 모범 답안을 정리한 자료입니다.',
            category: 'front',
            difficulty: 'beginner',
            type: 'document',
            duration: '1시간',
            url: 'https://docs.interview.com',
            tags: ['면접', '질문', '답안']
          },
          {
            id: 7,
            title: 'JavaScript ES6+ 완전정복',
            description: '모던 JavaScript의 핵심 기능들을 실습과 함께 학습합니다.',
            category: 'front',
            difficulty: 'beginner',
            type: 'video',
            duration: '3시간',
            url: 'https://youtube.com/es6',
            tags: ['JavaScript', 'ES6', '모던JS']
          },
          {
            id: 8,
            title: 'Docker 컨테이너 기초',
            description: 'Docker를 사용한 애플리케이션 컨테이너화와 배포 방법을 학습합니다.',
            category: 'back',
            difficulty: 'intermediate',
            type: 'practice',
            duration: '2시간',
            url: 'https://docker.com/tutorial',
            tags: ['Docker', '컨테이너', '배포']
          }
        ];

        setMaterials(mockMaterials);
        setFilteredMaterials(mockMaterials);
      } catch (error) {
        console.error('Load data error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  // 필터링 로직
  useEffect(() => {
    let filtered = materials;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(material => material.difficulty === selectedDifficulty);
    }

    if (searchQuery) {
      filtered = filtered.filter(material => 
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredMaterials(filtered);
  }, [materials, selectedCategory, selectedDifficulty, searchQuery]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return difficulty;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
      case 'article': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
      case 'document': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
      case 'practice': return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
      default: return null;
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
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-gray-900 mb-2">학습 자료</h1>
          <p className="text-gray-600">
            면접 준비에 도움이 되는 다양한 학습 자료를 확인해보세요.
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 검색 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목, 설명, 태그로 검색..."
                className="w-full px-4 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            {/* 카테고리 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 난이도 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">난이도</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 학습 자료 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-sm flex items-center justify-center text-gray-600">
                    {getTypeIcon(material.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{material.title}</h3>
                    <p className="text-sm text-gray-500">{categories.find(c => c.value === material.category)?.label}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(material.difficulty)}`}>
                  {getDifficultyLabel(material.difficulty)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{material.description}</p>

              {material.duration && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {material.duration}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {material.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {material.url && (
                <a
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <span>자료 보기</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push('/practice')}
            className="bg-gray-900 text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            면접 연습 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialsPage;
