'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { UserInfo } from '@/lib/types';
import { BaseURL } from '@/lib/util';

const DashboardPage = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
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
          setUserInfo(parsedUserInfo);
          
          // 온보딩이 완료되지 않았다면 온보딩으로 리다이렉트
          if (!parsedUserInfo.onboardingCompleted) {
            router.push('/onboarding');
            return;
          }
        } else {
          // 토큰이 유효하지 않으면 로그인 페이지로 이동
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
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

  if (!userInfo) {
    return null; // 리다이렉트 중
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <Header userInfo={userInfo} />

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-gray-900 mb-2">
            안녕하세요, {userInfo.name}님
          </h1>
          <p className="text-gray-600">
            오늘도 면접 준비를 시작해보세요.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">총 연습 횟수</p>
                <p className="text-2xl font-light text-gray-900">24</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">평균 점수</p>
                <p className="text-2xl font-light text-gray-900">85</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">이번 주 연습</p>
                <p className="text-2xl font-light text-gray-900">7</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">연속 학습일</p>
                <p className="text-2xl font-light text-gray-900">12</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 빠른 액션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-sm border border-gray-100 p-6">
              <h2 className="text-lg font-light text-gray-900 mb-4">빠른 시작</h2>
              <div className="space-y-3">
                <button className="w-full bg-gray-900 text-white py-3 px-4 rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  면접 연습 시작
                </button>
                <button className="w-full border border-gray-200 text-gray-700 py-3 px-4 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  분석 리포트 보기
                </button>
                <button className="w-full border border-gray-200 text-gray-700 py-3 px-4 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  학습 자료 보기
                </button>
              </div>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-sm border border-gray-100 p-6">
              <h2 className="text-lg font-light text-gray-900 mb-4">최근 활동</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-sm flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">기술 면접 연습 완료</p>
                      <p className="text-xs text-gray-500">점수: 92점</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">2시간 전</p>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-sm flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">분석 리포트 생성됨</p>
                      <p className="text-xs text-gray-500">개선점 3개 발견</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">어제</p>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-sm flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">새로운 학습 자료 추가</p>
                      <p className="text-xs text-gray-500">React 개발자 면접 가이드</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">2일 전</p>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-sm flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">연속 학습 10일 달성</p>
                      <p className="text-xs text-gray-500">축하합니다! 꾸준한 학습 중</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">3일 전</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 추천 섹션 */}
        <div className="mt-8">
          <div className="bg-white rounded-sm border border-gray-100 p-6">
            <h2 className="text-lg font-light text-gray-900 mb-4">오늘의 추천</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-100 rounded-sm p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <h3 className="text-sm font-medium text-gray-900 mb-2">알고리즘 문제 해결</h3>
                <p className="text-xs text-gray-600 mb-3">코딩 테스트 대비 알고리즘 면접 연습</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">난이도: 중급</span>
                  <span className="text-xs text-blue-600">시작하기 →</span>
                </div>
              </div>

              <div className="border border-gray-100 rounded-sm p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <h3 className="text-sm font-medium text-gray-900 mb-2">시스템 디자인</h3>
                <p className="text-xs text-gray-600 mb-3">대규모 시스템 설계 면접 준비</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">난이도: 고급</span>
                  <span className="text-xs text-blue-600">시작하기 →</span>
                </div>
              </div>

              <div className="border border-gray-100 rounded-sm p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <h3 className="text-sm font-medium text-gray-900 mb-2">행동 면접</h3>
                <p className="text-xs text-gray-600 mb-3">STAR 기법을 활용한 경험 기반 면접</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">난이도: 초급</span>
                  <span className="text-xs text-blue-600">시작하기 →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
