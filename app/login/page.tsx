'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { authService } from '@/services/authService';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(formData);

      // 토큰을 localStorage에 저장
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // 사용자 정보를 localStorage에 저장
      const userInfo = {
        userId: 1, // 실제로는 서버에서 받아온 사용자 ID
        name: formData.userId, // 임시로 userId를 이름으로 사용
        userType: formData.userId === 'admin' ? 'ADMIN' : 'USER',
        onboardingCompleted: true
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      // 대시보드로 리다이렉트
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 403) {
          setError('백엔드 서버에 접근할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else if (axiosError.response?.status === 401) {
          setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        } else if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else {
          setError('로그인에 실패했습니다. 네트워크 연결을 확인해주세요.');
        }
      } else {
        setError('로그인에 실패했습니다. 네트워크 연결을 확인해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // NextAuth의 기본 리다이렉션을 사용
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/dashboard'
      });
      
      if (result?.error) {
        setError('Google 로그인에 실패했습니다.');
        return;
      }
      
      if (result?.ok) {
        // 성공적으로 로그인된 경우 대시보드로 리다이렉션
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full h-screen bg-gray-50 flex items-center justify-center'>
      <div className='max-w-md w-full mx-4'>
        {/* 로고/브랜드 영역 */}
        <div className='text-center mb-12'>
          <Link href="/" className='text-3xl font-light text-gray-900 tracking-wide'>
            BUMAVIEW
          </Link>
          <div className='w-16 h-px bg-gray-300 mx-auto mt-4'></div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className='bg-white rounded-sm shadow-sm border border-gray-100 p-8'>
          <div className='text-center mb-8'>
            <h2 className='text-xl font-light text-gray-800 mb-2'>
              환영합니다
            </h2>
            <p className='text-sm text-gray-500 leading-relaxed'>
              면접 준비를 위한 여정을 시작해보세요
            </p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm'>
                {error}
              </div>
            )}

            <div>
              <input
                type='text'
                name='userId'
                placeholder='사용자 ID'
                value={formData.userId}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors'
              />
            </div>

            <div>
              <input
                type='password'
                name='password'
                placeholder='비밀번호'
                value={formData.password}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors'
              />
            </div>


            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-gray-900 text-white py-3 rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
            
            {/* 구분선 */}
            <div className='flex items-center my-6'>
              <div className='flex-1 h-px bg-gray-200'></div>
              <span className='px-4 text-xs text-gray-400'>또는</span>
              <div className='flex-1 h-px bg-gray-200'></div>
            </div>

            {/* 구글 로그인 버튼 */}
            <button
              type='button'
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className='w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? '로그인 중...' : 'Google로 로그인'}
            </button>
          </form>

          {/* 추가 링크 */}
          <div className='text-center mt-6 pt-6 border-t border-gray-100'>
            <p className='text-xs text-gray-400'>
              계정이 없으신가요?{' '}
              <Link href='/register' className='text-gray-600 hover:text-gray-800 transition-colors'>
                회원가입
              </Link>
            </p>
          </div>
        </div>

        {/* 하단 텍스트 */}
        <div className='text-center mt-8'>
          <p className='text-xs text-gray-400'>
            © 2024 BUMAVIEW. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;