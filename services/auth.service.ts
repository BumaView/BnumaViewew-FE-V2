import api from '@/lib/api';
import {
  LoginRequest,
  GoogleLoginRequest,
  SignUpRequest,
  LogoutRequest,
  LoginResponse,
  GoogleLoginResponse,
  SignUpResponse,
  LogoutResponse,
} from '@/types/api';

export const authService = {
  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', data);
    return response.data;
  },

  // 구글 로그인
  googleLogin: async (data: GoogleLoginRequest): Promise<GoogleLoginResponse> => {
    const response = await api.post<GoogleLoginResponse>('/api/auth/login/google', data);
    return response.data;
  },

  // 회원가입
  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    const response = await api.post<SignUpResponse>('/api/auth/sign-up', data);
    return response.data;
  },

  // 로그아웃
  logout: async (data: LogoutRequest): Promise<LogoutResponse> => {
    const response = await api.post<LogoutResponse>('/api/auth/logout', data);
    return response.data;
  },
};
