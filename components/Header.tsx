"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BaseURL } from "@/lib/util";

export interface UserInfo {
  name: string;
  userType: string;
}

export default function Header({ userInfo }: { userInfo: UserInfo | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // 토큰이 없으면 바로 로그인 페이지로 이동
        router.push('/login');
        return;
      }

      const response = await fetch(`${BaseURL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // 로컬 스토리지에서 토큰 제거
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        
        // 로그인 페이지로 이동
        router.push('/login');
      } else {
        console.error('로그아웃 실패');
        // 실패해도 토큰은 제거하고 로그인 페이지로 이동
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        router.push('/login');
      }
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      // 오류가 발생해도 토큰은 제거하고 로그인 페이지로 이동
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
<nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-light text-gray-900 tracking-wide">
                BUMAVIEW
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/dashboard" className={pathname === "/dashboard" ? "text-sm text-gray-900 font-medium" : "text-sm text-gray-500 hover:text-gray-900 transition-colors"}>
                  대시보드
                </Link>
                <Link href="/practice" className={pathname === "/practice" ? "text-sm text-gray-900 font-medium" : "text-sm text-gray-500 hover:text-gray-900 transition-colors"}>
                  면접 연습
                </Link>
                <Link href="/bookmarks" className={pathname === "/bookmarks" ? "text-sm text-gray-900 font-medium" : "text-sm text-gray-500 hover:text-gray-900 transition-colors"}>
                  북마크
                </Link>
                {userInfo?.userType === 'Admin' && (
                  <Link href="/admin" className={pathname === "/admin" ? "text-sm text-blue-600 font-medium" : "text-sm text-blue-600 hover:text-blue-800 transition-colors"}>
                    관리자
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600 font-medium">
                  {userInfo?.name.charAt(0)}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}