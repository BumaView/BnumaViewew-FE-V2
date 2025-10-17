// Google OAuth 관련 유틸리티 함수들

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1055022639559-es8qf9ldooropmnm5a1l2oj1o2tip1qi.apps.googleusercontent.com';
export const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3001/login';

// Google OAuth URL 생성
export const getGoogleAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// URL에서 authorization code 추출
export const getAuthorizationCodeFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
};

// Google OAuth 로그인 시작
export const startGoogleLogin = () => {
  window.location.href = getGoogleAuthUrl();
};

