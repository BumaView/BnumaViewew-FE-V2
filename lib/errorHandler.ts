//==== 공통 에러 처리 유틸리티 =====

export interface ApiError {
    message: string;
    statusCode?: number;
    code?: string;
}

export const handleApiError = (error: unknown): ApiError => {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
        return {
            message: error.message,
            statusCode: 500,
        };
    }
    
    if (typeof error === 'object' && error !== null) {
        const apiError = error as Record<string, unknown>;
        return {
            message: (apiError.message as string) || '알 수 없는 오류가 발생했습니다.',
            statusCode: (apiError.statusCode as number) || 500,
            code: apiError.code as string,
        };
    }
    
    return {
        message: '알 수 없는 오류가 발생했습니다.',
        statusCode: 500,
    };
};

export const isApiError = (error: unknown): error is ApiError => {
    return typeof error === 'object' && error !== null && 'message' in error;
};
