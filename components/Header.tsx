"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface UserInfo {
  name: string;
  userType: string;
}

export default function Header({ userInfo }: { userInfo: UserInfo | null }) {

  const pathname = usePathname();

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
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}