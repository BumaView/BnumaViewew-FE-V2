// ===== Mock Interview 관련 타입 =====
export type CreateMockInterviewRequest = {
    title: string;
    tags: string[];
    count: number;
};

export type CreateMockInterviewResponse = {
    id: number;
    title: string;
    questions: [
        {
            id: number;
            question: string;
        }
    ],
    createdAt: string;
};

export type SessionBySessionQuestionAnswerRecordsRequest = {
    questionId: number;
    answer: string;
    timeSpent: number;
};

export type SessionBySessionQuestionAnswerRecordsResponse = {
    interviewId: number;
    questionId: number;
    answer: string;
    timeSpent: number;
    recordedAt: string;
};

export type FinishedMockInterviewResponse = {
    interviewId: number;
    status: string;
    summary: {
        totalQuestions: number;
        totalTimeSpent: number;
        average: number;
        answers: [
            {
                questionId: number;
                timeSpent: number;
                answer: string;
            }
        ]
    }
};

// ===== Session 에러 관련 타입 =====
export type SessionError = {
    message: string;
    statusCode?: number;
};
