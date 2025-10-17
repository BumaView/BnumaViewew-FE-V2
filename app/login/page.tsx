'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getAuthorizationCodeFromUrl, startGoogleLogin } from '@/lib/google-auth';
import { decodeJWT } from '@/lib/jwt';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth 콜백 처리
  useEffect(() => {
    const authCode = getAuthorizationCodeFromUrl();
    if (authCode) {
      handleGoogleLoginCallback(authCode);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userId.trim()) {
      newErrors.userId = '아이디를 입력해주세요.';
    }

    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setLoading(true);

    try {
      const response = await authService.login(formData);
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Decode JWT token to get user information
      const payload = decodeJWT(response.accessToken);
      if (!payload) {
        throw new Error('토큰을 디코딩할 수 없습니다.');
      }
      
      console.log('JWT Payload:', payload);
      console.log('userId from payload:', payload.userId, 'type:', typeof payload.userId);
      
      // Create user object
      const user = {
        userType: payload.userType, // Keep original case: 'ADMIN' or 'USER'
        userId: payload.userId, // Keep as string
        name: payload.userId, // Use userId as name for now
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };
      
      console.log('Created user object:', user);
      
      // Update auth store
      setUser(user);
      
      // Redirect based on user type
      if (user.userType === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setErrors({
        general: error.message || '로그인에 실패했습니다.',
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleGoogleLoginCallback = async (authCode: string) => {
    try {
      setIsLoading(true);
      setLoading(true);
      
      const response = await authService.googleLogin({ authorizationCode: authCode });
      
      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Update auth store
      setUser(response);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Redirect based on user type
      if (response.userType === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setErrors({
        general: error.message || 'Google 로그인에 실패했습니다.',
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    startGoogleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">BumaView</h2>
          <p className="mt-2 text-gray-600">면접 준비의 새로운 기준</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <Input
                label="아이디"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                error={errors.userId}
                placeholder="아이디를 입력하세요"
                disabled={isLoading}
              />

              <Input
                label="비밀번호"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="비밀번호를 입력하세요"
                disabled={isLoading}
              />

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                로그인
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 로그인
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  회원가입
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}