import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", // 로컬 API 서버 URL
    timeout: 30000, // 30초로 증가
    headers: {
        "Content-Type": "application/json",
    },
});

// 디버깅을 위한 요청 인터셉터 추가
api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.method?.toUpperCase(), (config.baseURL || '') + config.url);
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
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
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
        if (error.response?.status === 401) {
            // 클라이언트 사이드에서만 localStorage 접근
            if (typeof window !== 'undefined') {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);