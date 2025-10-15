import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", // 로컬 API 서버 URL
    timeout: 60000, // 60초로 증가 (백엔드 서버가 느림)
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
        
        // 프로덕션에서도 에러를 확인할 수 있도록 alert 추가
        if (process.env.NODE_ENV === 'production') {
            console.error('Production Error Details:', {
                message: error.message,
                status: error.response?.status,
                url: error.config?.url,
                method: error.config?.method
            });
        }
        
        if (error.response?.status === 401) {
            // 클라이언트 사이드에서만 localStorage 접근
            if (typeof window !== 'undefined') {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
            }
        }
        
        if (error.response?.status === 403) {
            console.error('403 Forbidden - 백엔드 API 접근 권한이 없습니다.');
            console.error('Response Data:', error.response?.data);
            console.error('Request URL:', error.config?.url);
            console.error('Request Method:', error.config?.method);
        }
        
        return Promise.reject(error);
    }
);