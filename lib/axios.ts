import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://bumaview-be.onrender.com", // 백엔드 서버 URL
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
            // 토큰 만료 시 로그아웃 처리
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);