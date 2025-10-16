import axios from "axios";

// 커스텀 에러 타입 정의
interface NetworkError extends Error {
  isNetworkError: boolean;
  originalError: unknown;
}

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080", // 백엔드 API 서버 URL
    timeout: 600000, // 600초로 증가 (Google Sheets 처리 시간 고려)
    headers: {
        "Content-Type": "application/json",
    },
});

// 디버깅을 위한 요청 인터셉터 추가
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), (config.baseURL || '') + config.url);
        console.log('Request headers:', config.headers);
        console.log('Request data:', config.data);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
    (config) => {
        // 클라이언트 사이드에서만 localStorage 접근
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem("accessToken");
            console.log('Token found:', token ? 'Yes' : 'No');
            console.log('Token value:', token ? `${token.substring(0, 20)}...` : 'None');
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('Authorization header set:', config.headers.Authorization);
            } else {
                console.warn('No access token found in localStorage');
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        console.error('Error Status:', error.response?.status);
        console.error('Error Headers:', error.response?.headers);
        console.error('Request URL:', error.config?.url);
        console.error('Request Method:', error.config?.method);
        console.error('Full Error Object:', error);
        
        // 네트워크 에러 처리
        if (!error.response) {
            console.error('Network Error - 서버에 연결할 수 없습니다.');
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            
            // 네트워크 에러를 사용자에게 알리기 위해 커스텀 에러 생성
            const networkError = new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.') as NetworkError;
            networkError.isNetworkError = true;
            networkError.originalError = error;
            return Promise.reject(networkError);
        }
        
        // HTTP 상태 코드별 처리
        const status = error.response.status;
        const responseData = error.response.data;
        
        if (status === 401) {
            console.error('401 Unauthorized - 인증이 필요합니다.');
            // 클라이언트 사이드에서만 localStorage 접근
            if (typeof window !== 'undefined') {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userInfo");
                // 로그인 페이지로 리다이렉트
                window.location.href = "/login";
            }
        }
        
        if (status === 403) {
            console.error('403 Forbidden - API 접근 권한이 없습니다.');
            console.error('Response Data:', responseData);
            console.error('Request URL:', error.config?.url);
            console.error('Request Method:', error.config?.method);
        }
        
        if (status === 404) {
            console.error('404 Not Found - 요청한 리소스를 찾을 수 없습니다.');
            console.error('Request URL:', error.config?.url);
        }
        
        if (status === 500) {
            console.error('500 Internal Server Error - 서버 내부 오류가 발생했습니다.');
            console.error('Response Data:', responseData);
        }
        
        if (status >= 500) {
            console.error(`${status} Server Error - 서버 오류가 발생했습니다.`);
            console.error('Response Data:', responseData);
        }
        
        // 프로덕션에서도 에러를 확인할 수 있도록 상세 로그 추가
        if (process.env.NODE_ENV === 'production') {
            console.error('Production Error Details:', {
                message: error.message,
                status: error.response?.status,
                url: error.config?.url,
                method: error.config?.method,
                responseData: responseData
            });
        }
        
        return Promise.reject(error);
    }
);