'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardResponse } from '@/types/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, router]);

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
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

  const stats = [
    {
      title: '총 문제 수',
      value: dashboardData?.totalQuestions || 0,
      icon: '📚',
      color: 'bg-blue-500',
    },
    {
      title: '북마크 수',
      value: dashboardData?.totalBookmarks || 0,
      icon: '🔖',
      color: 'bg-green-500',
    },
    {
      title: '면접 횟수',
      value: dashboardData?.totalInterviews || 0,
      icon: '🎯',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          안녕하세요, {user?.name}님! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          오늘도 면접 준비를 시작해보세요.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>면접 연습 시작</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              다양한 문제로 모의면접을 연습해보세요.
            </p>
            <Link href="/practice">
              <Button className="w-full">
                면접 연습하기
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>질문 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              등록된 면접 질문들을 확인하고 상세 정보를 보세요.
            </p>
            <Link href="/questions">
              <Button variant="outline" className="w-full">
                질문 보기
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>북마크 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              중요한 문제들을 북마크로 관리하세요.
            </p>
            <Link href="/bookmarks">
              <Button variant="outline" className="w-full">
                북마크 보기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Section */}
      {user?.userType === 'ADMIN' && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>관리자 기능</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              문제 관리 및 시스템 설정을 할 수 있습니다.
            </p>
            <Link href="/admin">
              <Button variant="secondary">
                관리자 페이지로 이동
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}