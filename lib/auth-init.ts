import { decodeJWT } from './jwt';

// 앱 초기화 시 JWT 토큰에서 사용자 정보 복원
export const initializeAuth = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return null;
  }

  const payload = decodeJWT(token);
  if (!payload) {
    // 토큰이 유효하지 않으면 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }

  // 토큰 만료 확인
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    // 토큰이 만료되었으면 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }

  return {
    userType: payload.userType, // Keep original case: 'ADMIN' or 'USER'
    userId: payload.userId, // Keep as string
    name: payload.userId,
    accessToken: token,
    refreshToken: localStorage.getItem('refreshToken') || '',
  };
};
