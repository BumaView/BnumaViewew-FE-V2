'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import Header from './Header';
import { initializeAuth } from '@/lib/auth-init';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    // 앱 초기화 시 JWT 토큰에서 사용자 정보 복원
    const user = initializeAuth();
    if (user) {
      setUser(user);
    }
  }, [setUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Header />}
      <main className={isAuthenticated ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  );
};

export default Layout;

