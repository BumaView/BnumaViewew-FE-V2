'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.userType === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8">
            <span className="text-white font-bold text-3xl">B</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            BumaView
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            면접 준비의 새로운 기준을 제시합니다.<br />
            체계적인 연습과 관리로 완벽한 면접을 준비하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                로그인
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                회원가입
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            왜 BumaView인가요?
          </h2>
          <p className="text-lg text-gray-600">
            체계적이고 효율적인 면접 준비를 위한 모든 기능을 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                모의면접 연습
              </h3>
              <p className="text-gray-600">
                실제 면접과 같은 환경에서 연습할 수 있는 모의면접 기능을 제공합니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                다양한 문제
              </h3>
              <p className="text-gray-600">
                다양한 회사와 카테고리의 면접 문제를 제공하여 폭넓은 준비가 가능합니다.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                북마크 관리
              </h3>
              <p className="text-gray-600">
                중요한 문제들을 폴더별로 정리하여 효율적으로 관리할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 시작하세요
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            무료로 회원가입하고 면접 준비를 시작해보세요.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-white">BumaView</span>
            </div>
            <p className="text-gray-400">
              © 2024 BumaView. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}