// JWT 토큰 디코딩 유틸리티
export interface JWTPayload {
  sub: string;
  userId: string;
  userType: 'USER' | 'ADMIN';
  iat: number;
  exp: number;
}

export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // JWT 토큰은 base64로 인코딩된 3부분으로 구성됨 (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // payload 부분 디코딩
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};
