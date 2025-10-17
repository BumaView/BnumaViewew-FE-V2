'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface ReportData {
  totalInterviews: number;
  averageScore: number;
  totalTimeSpent: number;
  categoryStats: {
    category: string;
    count: number;
    averageScore: number;
  }[];
  recentInterviews: {
    id: number;
    title: string;
    score: number;
    completedAt: string;
  }[];
  improvementAreas: string[];
  strengths: string[];
}

const ReportsPage = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

        // 임시 리포트 데이터 (실제로는 API에서 가져와야 함)
        const mockReportData: ReportData = {
          totalInterviews: 12,
          averageScore: 78,
          totalTimeSpent: 240, // 분
          categoryStats: [
            { category: '기술면접', count: 8, averageScore: 82 },
            { category: '인성면접', count: 4, averageScore: 72 }
          ],
          recentInterviews: [
            { id: 1, title: 'React 면접', score: 85, completedAt: '2024-01-15' },
            { id: 2, title: 'JavaScript 면접', score: 78, completedAt: '2024-01-14' },
            { id: 3, title: '자기소개 면접', score: 90, completedAt: '2024-01-13' }
          ],
          improvementAreas: ['데이터베이스', '네트워크', '알고리즘'],
          strengths: ['React', 'JavaScript', '커뮤니케이션']
        };

        setReportData(mockReportData);
      } catch (error) {
        console.error('Load data error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

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

  if (!reportData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-gray-900 mb-2">분석 리포트</h1>
          <p className="text-gray-600">
            면접 연습 결과를 분석하여 성장 포인트를 확인해보세요.
          </p>
        </div>

        {/* 전체 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">총 면접 수</p>
                <p className="text-3xl font-light text-gray-900">{reportData.totalInterviews}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">평균 점수</p>
                <p className="text-3xl font-light text-gray-900">{reportData.averageScore}점</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">총 연습 시간</p>
                <p className="text-3xl font-light text-gray-900">{reportData.totalTimeSpent}분</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 카테고리별 통계 */}
          <div className="bg-white rounded-sm border border-gray-100 p-6">
            <h2 className="text-lg font-light text-gray-900 mb-6">카테고리별 성과</h2>
            <div className="space-y-4">
              {reportData.categoryStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{stat.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{stat.averageScore}점</p>
                    <p className="text-xs text-gray-500">{stat.count}회</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 최근 면접 결과 */}
          <div className="bg-white rounded-sm border border-gray-100 p-6">
            <h2 className="text-lg font-light text-gray-900 mb-6">최근 면접 결과</h2>
            <div className="space-y-4">
              {reportData.recentInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{interview.title}</p>
                    <p className="text-xs text-gray-500">{interview.completedAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{interview.score}점</p>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${interview.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 강점 분석 */}
          <div className="bg-white rounded-sm border border-gray-100 p-6">
            <h2 className="text-lg font-light text-gray-900 mb-6">강점 분석</h2>
            <div className="space-y-3">
              {reportData.strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-sm flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 개선 영역 */}
          <div className="bg-white rounded-sm border border-gray-100 p-6">
            <h2 className="text-lg font-light text-gray-900 mb-6">개선 영역</h2>
            <div className="space-y-3">
              {reportData.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-sm flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push('/practice')}
            className="bg-gray-900 text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            면접 연습 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
