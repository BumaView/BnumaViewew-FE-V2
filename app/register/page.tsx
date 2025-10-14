'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    id: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'USER' as 'USER' | 'ADMIN'
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

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        id: formData.id,
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
        userType: formData.userType
      });

      // 토큰을 localStorage에 저장
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // 온보딩으로 이동
      router.push('/onboarding');
    } catch (error: any) {
      setError(error.message || '회원가입에 실패했습니다.');
    } finally {
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
              회원가입
            </h2>
            <p className='text-sm text-gray-500 leading-relaxed'>
              BUMAVIEW에서 면접 준비를 시작해보세요
            </p>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm'>
                {error}
              </div>
            )}

            <div>
              <input
                type='text'
                name='id'
                placeholder='사용자 ID'
                value={formData.id}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors'
              />
            </div>

            <div>
              <input
                type='text'
                name='nickname'
                placeholder='닉네임'
                value={formData.nickname}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors'
              />
            </div>

            <div>
              <input
                type='email'
                name='email'
                placeholder='이메일'
                value={formData.email}
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

            <div>
              <input
                type='password'
                name='confirmPassword'
                placeholder='비밀번호 확인'
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors'
              />
            </div>

            <div>
              <select
                name='userType'
                value={formData.userType}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-700 focus:outline-none focus:border-gray-400 transition-colors'
              >
                <option value='USER'>일반 사용자</option>
                <option value='ADMIN'>관리자</option>
              </select>
            </div>


            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-gray-900 text-white py-3 rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          {/* 추가 링크 */}
          <div className='text-center mt-6 pt-6 border-t border-gray-100'>
            <p className='text-xs text-gray-400'>
              이미 계정이 있으신가요?{' '}
              <Link href='/login' className='text-gray-600 hover:text-gray-800 transition-colors'>
                로그인
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

export default RegisterPage;
