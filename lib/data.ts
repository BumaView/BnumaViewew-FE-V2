// 면접 질문 및 세션 데이터 모델

export interface Question {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  field: string;
  company?: string; // 회사 이름 (선택적)
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSession {
  id: number;
  userId: number;
  questions: Question[];
  startedAt: string;
  finishedAt?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  answers: InterviewAnswer[];
  questionTimes?: { [questionId: number]: number }; // 각 질문별 소요 시간 (초)
  totalTime?: number; // 전체 면접 소요 시간 (초)
  score?: number;
  feedback?: string;
}

export interface InterviewAnswer {
  questionId: number;
  answer: string;
  timeSpent: number; // seconds
  score?: number;
  feedback?: string;
}

export interface Bookmark {
  id: number;
  userId: number;
  questionId: number;
  folderId?: number;
  createdAt: string;
}

export interface BookmarkFolder {
  id: number;
  userId: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 목 데이터
export const mockQuestions: Question[] = [
  {
    id: 1,
    title: "React의 생명주기에 대해 설명해주세요",
    content: "React 컴포넌트의 생명주기 메서드들과 각각의 역할에 대해 설명하고, 함수형 컴포넌트에서는 어떻게 처리하는지 말씀해주세요.",
    category: "기술면접",
    difficulty: "medium",
    field: "프론트엔드 개발",
    company: "카카오",
    tags: ["React", "생명주기", "Hooks"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    title: "데이터베이스 정규화에 대해 설명해주세요",
    content: "데이터베이스 정규화의 개념과 1NF, 2NF, 3NF의 차이점에 대해 설명하고, 정규화의 장단점을 말씀해주세요.",
    category: "기술면접",
    difficulty: "hard",
    field: "백엔드 개발",
    company: "네이버",
    tags: ["Database", "정규화", "SQL"],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z"
  },
  {
    id: 3,
    title: "자신의 장점과 단점을 말씀해주세요",
    content: "본인이 생각하는 가장 큰 장점과 단점을 하나씩 말씀해주시고, 단점을 극복하기 위해 어떤 노력을 하고 계신지 설명해주세요.",
    category: "인성면접",
    difficulty: "easy",
    field: "공통",
    company: "토스",
    tags: ["자기소개", "장단점", "성장"],
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z"
  },
  {
    id: 4,
    title: "REST API와 GraphQL의 차이점은 무엇인가요?",
    content: "REST API와 GraphQL의 주요 차이점을 설명하고, 각각의 장단점과 언제 사용하면 좋을지 말씀해주세요.",
    category: "기술면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "쿠팡",
    tags: ["REST", "GraphQL", "API"],
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z"
  },
  {
    id: 5,
    title: "팀 프로젝트에서 갈등이 생겼을 때 어떻게 해결하시나요?",
    content: "팀 프로젝트 진행 중 팀원들과 의견 충돌이나 갈등 상황이 발생했을 때, 어떤 방식으로 문제를 해결하시는지 구체적인 경험과 함께 말씀해주세요.",
    category: "인성면접",
    difficulty: "medium",
    field: "공통",
    tags: ["팀워크", "갈등해결", "커뮤니케이션"],
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z"
  },
  {
    id: 6,
    title: "JavaScript의 클로저(Closure)에 대해 설명해주세요",
    content: "JavaScript의 클로저 개념을 설명하고, 실제 사용 예시와 클로저를 사용할 때의 장점과 주의점을 말씀해주세요.",
    category: "기술면접",
    difficulty: "hard",
    field: "프론트엔드 개발",
    tags: ["JavaScript", "Closure", "스코프"],
    createdAt: "2024-01-06T00:00:00Z",
    updatedAt: "2024-01-06T00:00:00Z"
  },
  {
    id: 7,
    title: "우리 회사를 선택한 이유는 무엇인가요?",
    content: "수많은 회사 중에서 저희 회사에 지원하게 된 특별한 이유가 있다면 말씀해주세요. 회사에 대해 어떤 부분을 알고 계시나요?",
    category: "인성면접",
    difficulty: "easy",
    field: "공통",
    tags: ["지원동기", "회사연구", "비전"],
    createdAt: "2024-01-07T00:00:00Z",
    updatedAt: "2024-01-07T00:00:00Z"
  },
  {
    id: 8,
    title: "Docker와 Kubernetes의 차이점을 설명해주세요",
    content: "Docker와 Kubernetes의 개념과 주요 차이점을 설명하고, 각각이 해결하는 문제와 함께 사용했을 때의 장점을 말씀해주세요.",
    category: "기술면접",
    difficulty: "hard",
    field: "DevOps",
    tags: ["Docker", "Kubernetes", "컨테이너"],
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-08T00:00:00Z"
  },
  {
    id: 9,
    title: "5년 후 본인의 모습을 어떻게 그리고 계시나요?",
    content: "5년 후 개발자로서, 그리고 개인으로서 어떤 모습이 되고 싶으신지 구체적인 목표와 계획을 말씀해주세요.",
    category: "인성면접",
    difficulty: "medium",
    field: "공통",
    tags: ["목표", "비전", "성장계획"],
    createdAt: "2024-01-09T00:00:00Z",
    updatedAt: "2024-01-09T00:00:00Z"
  },
  {
    id: 10,
    title: "SQL 인젝션 공격과 방어 방법을 설명해주세요",
    content: "SQL 인젝션 공격의 원리와 실제 공격 예시를 설명하고, 이를 방어하기 위한 다양한 방법들을 말씀해주세요.",
    category: "기술면접",
    difficulty: "medium",
    field: "백엔드 개발",
    tags: ["보안", "SQL", "인젝션"],
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z"
  },
  {
    id: 11,
    title: "머신러닝에서 과적합(Overfitting)이란 무엇인가요?",
    content: "과적합의 개념과 발생 원인을 설명하고, 과적합을 방지하기 위한 다양한 기법들을 구체적인 예시와 함께 말씀해주세요.",
    category: "기술면접",
    difficulty: "hard",
    field: "AI/ML 엔지니어",
    tags: ["머신러닝", "과적합", "정규화"],
    createdAt: "2024-01-11T00:00:00Z",
    updatedAt: "2024-01-11T00:00:00Z"
  },
  {
    id: 12,
    title: "가장 기억에 남는 프로젝트를 소개해주세요",
    content: "지금까지 진행했던 프로젝트 중 가장 기억에 남거나 의미 있었던 프로젝트를 소개하고, 그 프로젝트에서 본인의 역할과 배운 점을 말씀해주세요.",
    category: "인성면접",
    difficulty: "easy",
    field: "공통",
    tags: ["프로젝트", "경험", "학습"],
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z"
  },
  
  // Google Sheets 데이터 추가 (2023년 면접 질문들)
  // 마이다스IT (2023) - 백엔드
  {
    id: 13,
    title: "간단한 자기소개",
    content: "간단한 자기소개를 해주세요.",
    category: "인성면접",
    difficulty: "easy",
    field: "백엔드 개발",
    company: "마이다스IT",
    tags: ["자기소개", "인성"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 14,
    title: "가장 기억에 남는 프로젝트는?",
    content: "가장 기억에 남는 프로젝트는 무엇인가요?",
    category: "기술면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "마이다스IT",
    tags: ["프로젝트", "경험"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 15,
    title: "프로젝트를 하면서 가장 중요하다고 생각하는 것은?",
    content: "프로젝트를 하면서 가장 중요하다고 생각하는 것은 무엇인가요?",
    category: "기술면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "마이다스IT",
    tags: ["프로젝트", "개발철학"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 16,
    title: "프로젝트를 하면서 문제를 느끼고 개선해야겠다고 생각한 것은?",
    content: "프로젝트를 하면서 문제를 느끼고 개선해야겠다고 생각한 것은 무엇인가요?",
    category: "기술면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "마이다스IT",
    tags: ["문제해결", "개선"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 17,
    title: "개발 말고 다른 기획이나 그런 거에도 참여해본 적이 있는지?",
    content: "개발 말고 다른 기획이나 그런 거에도 참여해본 적이 있나요?",
    category: "기술면접",
    difficulty: "easy",
    field: "백엔드 개발",
    company: "마이다스IT",
    tags: ["기획", "다양한경험"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 18,
    title: "형상 관리 툴을 사용해본 적이 있는지?(git 등)",
    content: "형상 관리 툴을 사용해본 적이 있나요?(git 등)",
    category: "기술면접",
    difficulty: "easy",
    field: "백엔드 개발",
    company: "마이다스IT",
    tags: ["Git", "형상관리", "버전관리"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 19,
    title: "개발할 때 컨벤션은 정해놓고 하는지? (코딩 스타일 규약)",
    content: "개발할 때 컨벤션은 정해놓고 하나요? (코딩 스타일 규약)",
    category: "기술면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "마이다스IT",
    tags: ["코딩컨벤션", "코딩스타일"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 20,
    title: "프로젝트를 할 때 일을 어떻게 나누는지?",
    content: "프로젝트를 할 때 일을 어떻게 나누나요?",
    category: "기술면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "마이다스IT",
    tags: ["프로젝트관리", "업무분담"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 21,
    title: "개발자로서 어떤 것에 관심이 있고 5년 후 어떤 모습이면 좋을 것 같은지?",
    content: "개발자로서 어떤 것에 관심이 있고 5년 후 어떤 모습이면 좋을 것 같은가요?",
    category: "인성면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "마이다스IT",
    tags: ["비전", "관심사", "미래계획"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 22,
    title: "프리라이더가 있으면 어떻게?",
    content: "프리라이더가 있으면 어떻게 하시나요?",
    category: "인성면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "마이다스IT",
    tags: ["팀워크", "문제해결"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 23,
    title: "인턴 하면서 무슨 역할?",
    content: "인턴 하면서 무슨 역할을 맡으셨나요?",
    category: "기술면접",
    difficulty: "easy",
    field: "백엔드 개발",
    company: "마이다스IT",
    tags: ["인턴", "역할"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 24,
    title: "소마고에 왜 갔는지?",
    content: "소마고에 왜 가게 되셨나요?",
    category: "인성면접",
    difficulty: "easy",
    field: "공통",
    company: "마이다스IT",
    tags: ["동기", "선택이유"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 25,
    title: "왜 개발자가 되고 싶은지?",
    content: "왜 개발자가 되고 싶으신가요?",
    category: "인성면접",
    difficulty: "easy",
    field: "공통",
    company: "마이다스IT",
    tags: ["동기", "개발자"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 26,
    title: "우리 회사에 온다면 하고 싶은 일은?",
    content: "우리 회사에 온다면 하고 싶은 일은 무엇인가요?",
    category: "인성면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "마이다스IT",
    tags: ["회사", "희망업무"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 27,
    title: "마지막으로 물어보고 싶은 거나 할 말은?",
    content: "마지막으로 물어보고 싶은 거나 할 말이 있나요?",
    category: "인성면접",
    difficulty: "easy",
    field: "공통",
    company: "마이다스IT",
    tags: ["질문", "마무리"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  
  // 신한은행 (2023) - 은행
  {
    id: 28,
    title: "주로 자소서나 포트폴리오를 중점으로 질문하기 때문에 꼭 내용 숙지하기!",
    content: "주로 자소서나 포트폴리오를 중점으로 질문하기 때문에 꼭 내용을 숙지하세요!",
    category: "인성면접",
    difficulty: "easy",
    field: "공통",
    company: "신한은행",
    tags: ["자소서", "포트폴리오", "준비"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 29,
    title: "Q1. 1분 자기소개",
    content: "1분 자기소개를 해주세요.",
    category: "인성면접",
    difficulty: "easy",
    field: "공통",
    company: "신한은행",
    tags: ["자기소개", "1분"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 30,
    title: "Q2. 코딩테스트 잘 보셨는지 / 왜 자신이 잘하는 언어가 아닌 파이썬을 사용하셨나요?",
    content: "코딩테스트 잘 보셨는지, 그리고 왜 자신이 잘하는 언어가 아닌 파이썬을 사용하셨나요?",
    category: "기술면접",
    difficulty: "medium",
    field: "공통",
    company: "신한은행",
    tags: ["코딩테스트", "파이썬", "언어선택"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 31,
    title: "경험 기반",
    content: "경험 기반 질문입니다.",
    category: "기술면접",
    difficulty: "medium",
    field: "공통",
    company: "신한은행",
    tags: ["경험", "기반"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 32,
    title: "Q1. 인턴에서 어떤 업무를 맡았고 / 어떤 결과를 냈는지 알 수 있을까요?",
    content: "인턴에서 어떤 업무를 맡았고, 어떤 결과를 냈는지 알 수 있을까요?",
    category: "기술면접",
    difficulty: "medium",
    field: "공통",
    company: "신한은행",
    tags: ["인턴", "업무", "결과"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  
  // 블루바이저 AI (2023) - 프론트엔드
  {
    id: 33,
    title: "성격장단점",
    content: "성격의 장단점에 대해 말해주세요.",
    category: "인성면접",
    difficulty: "easy",
    field: "프론트엔드 개발",
    company: "블루바이저 AI",
    tags: ["성격", "장단점"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 34,
    title: "가장자신있는 개발언어와 해당 언어로 진행했던 대표적인 프로젝트 설명",
    content: "가장 자신있는 개발언어와 해당 언어로 진행했던 대표적인 프로젝트를 설명해주세요.",
    category: "기술면접",
    difficulty: "medium",
    field: "프론트엔드 개발",
    company: "블루바이저 AI",
    tags: ["개발언어", "프로젝트", "경험"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 35,
    title: "데이터베이스 트랜잭션의 처리과정 중 commit과 rolback에 대해 설명",
    content: "데이터베이스 트랜잭션의 처리과정 중 commit과 rollback에 대해 설명해주세요.",
    category: "기술면접",
    difficulty: "hard",
    field: "백엔드 개발",
    company: "블루바이저 AI",
    tags: ["데이터베이스", "트랜잭션", "commit", "rollback"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 36,
    title: "nosql이란 무엇이고 rdms와 비교하여 장단점 설명",
    content: "NoSQL이란 무엇이고 RDBMS와 비교하여 장단점을 설명해주세요.",
    category: "기술면접",
    difficulty: "hard",
    field: "백엔드 개발",
    company: "블루바이저 AI",
    tags: ["NoSQL", "RDBMS", "데이터베이스", "비교"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  
  // 아이디노 (2023) - 백엔드
  {
    id: 37,
    title: "자기소개",
    content: "자기소개를 해주세요.",
    category: "인성면접",
    difficulty: "easy",
    field: "백엔드 개발",
    company: "아이디노",
    tags: ["자기소개"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 38,
    title: "되고싶은 사람 되기싫은 사람",
    content: "되고싶은 사람과 되기싫은 사람에 대해 말해주세요.",
    category: "인성면접",
    difficulty: "medium",
    field: "공통",
    company: "아이디노",
    tags: ["가치관", "인성"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 39,
    title: "기술이 서버 지원이 안되면 어떻게?",
    content: "기술이 서버 지원이 안되면 어떻게 하시나요?",
    category: "기술면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "아이디노",
    tags: ["서버", "문제해결", "대안"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 40,
    title: "스타트업같은 불안정이랑 안정적 뭐가 더 좋은지",
    content: "스타트업같은 불안정과 안정적인 환경 중 뭐가 더 좋다고 생각하시나요?",
    category: "인성면접",
    difficulty: "medium",
    field: "공통",
    company: "아이디노",
    tags: ["스타트업", "안정성", "선호도"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 41,
    title: "TCP 프로젝트 이름 이유",
    content: "TCP 프로젝트 이름을 지은 이유는 무엇인가요?",
    category: "기술면접",
    difficulty: "easy",
    field: "백엔드 개발",
    company: "아이디노",
    tags: ["TCP", "프로젝트명", "네트워크"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 42,
    title: "기숙사 문 제어 서비스 보안 문제는 어떻게",
    content: "기숙사 문 제어 서비스의 보안 문제는 어떻게 해결하시나요?",
    category: "기술면접",
    difficulty: "hard",
    field: "백엔드 개발",
    company: "아이디노",
    tags: ["보안", "IoT", "문제해결"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 43,
    title: "DB 뭐 써보셨나요?",
    content: "어떤 데이터베이스를 사용해보셨나요?",
    category: "기술면접",
    difficulty: "easy",
    field: "백엔드 개발",
    company: "아이디노",
    tags: ["데이터베이스", "경험"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 44,
    title: "디자인 툴 뭐 써보셨나요",
    content: "어떤 디자인 툴을 사용해보셨나요?",
    category: "기술면접",
    difficulty: "easy",
    field: "프론트엔드 개발",
    company: "아이디노",
    tags: ["디자인", "툴", "경험"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 45,
    title: "의사소통 갈등 상황",
    content: "의사소통에서 갈등이 생긴 상황에 대해 말해주세요.",
    category: "인성면접",
    difficulty: "medium",
    field: "공통",
    company: "아이디노",
    tags: ["의사소통", "갈등", "문제해결"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 46,
    title: "게시판 처음부터 끝까지 개발할 수 있나요?",
    content: "게시판을 처음부터 끝까지 개발할 수 있나요?",
    category: "기술면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "아이디노",
    tags: ["게시판", "풀스택", "개발능력"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 47,
    title: "DB 테이블 몇개쓰세요?",
    content: "데이터베이스에서 테이블을 몇 개 사용하시나요?",
    category: "기술면접",
    difficulty: "easy",
    field: "백엔드 개발",
    company: "아이디노",
    tags: ["데이터베이스", "테이블", "설계"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 48,
    title: "DB 설계 해보셨나요?",
    content: "데이터베이스 설계를 해보셨나요?",
    category: "기술면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "아이디노",
    tags: ["데이터베이스", "설계", "경험"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 49,
    title: "TCP 개발하면서 힘들었던 점",
    content: "TCP 개발하면서 힘들었던 점은 무엇인가요?",
    category: "기술면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "아이디노",
    tags: ["TCP", "개발", "어려움"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 50,
    title: "프로젝트 할때 주로 몇명이서 하는지",
    content: "프로젝트 할 때 주로 몇 명이서 하나요?",
    category: "기술면접",
    difficulty: "easy",
    field: "공통",
    company: "아이디노",
    tags: ["프로젝트", "팀규모", "협업"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  },
  
  // 니더 (2023) - 백엔드
  {
    id: 51,
    title: "다른 분야의 개발도 많이 해본 것 같은데 왜 백엔드로 정하게 되었는가",
    content: "다른 분야의 개발도 많이 해본 것 같은데 왜 백엔드로 정하게 되었나요?",
    category: "인성면접",
    difficulty: "medium",
    field: "백엔드 개발",
    company: "니더",
    tags: ["백엔드", "선택이유", "동기"],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z"
  }
];

export const mockInterviewSessions: InterviewSession[] = [
  {
    id: 1,
    userId: 1,
    questions: [mockQuestions[0], mockQuestions[2], mockQuestions[6]],
    startedAt: "2024-01-15T09:00:00Z",
    finishedAt: "2024-01-15T09:45:00Z",
    status: "completed",
    answers: [
      {
        questionId: 1,
        answer: "React 컴포넌트의 생명주기는 크게 마운트, 업데이트, 언마운트 단계로 나눌 수 있습니다...",
        timeSpent: 180,
        score: 85,
        feedback: "생명주기에 대한 기본적인 이해는 좋으나, Hooks와의 연관성을 더 구체적으로 설명하면 좋겠습니다."
      },
      {
        questionId: 3,
        answer: "제 장점은 꼼꼼함이고, 단점은 완벽주의 성향입니다...",
        timeSpent: 120,
        score: 78,
        feedback: "솔직한 답변이 좋습니다. 단점 극복 노력을 더 구체적으로 말씀해주시면 더 좋겠습니다."
      },
      {
        questionId: 7,
        answer: "카카오는 사용자 중심의 서비스를 만드는 것으로 유명하고...",
        timeSpent: 150,
        score: 92,
        feedback: "회사에 대한 충분한 연구와 명확한 지원동기가 잘 드러납니다."
      }
    ],
    score: 85,
    feedback: "전반적으로 좋은 답변이었습니다. 기술적인 부분에서 더 깊이 있는 설명을 추가하시면 더 좋겠습니다."
  }
];

export const mockBookmarkFolders: BookmarkFolder[] = [
  {
    id: 1,
    userId: 1,
    name: "기술면접 준비",
    description: "프론트엔드 기술면접 대비 질문들",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    userId: 1,
    name: "인성면접 준비",
    description: "인성면접 관련 질문들",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z"
  }
];

export const mockBookmarks: Bookmark[] = [
  {
    id: 1,
    userId: 1,
    questionId: 1,
    folderId: 1,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    userId: 1,
    questionId: 6,
    folderId: 1,
    createdAt: "2024-01-15T10:05:00Z"
  },
  {
    id: 3,
    userId: 1,
    questionId: 3,
    folderId: 2,
    createdAt: "2024-01-15T10:10:00Z"
  }
];

// 메모리 기반 데이터 저장소
// 개발 모드에서 Hot Reload 시 데이터 보존을 위한 전역 변수 사용
declare global {
  var __questions: Question[] | undefined;
  var __interviewSessions: InterviewSession[] | undefined;
  var __bookmarkFolders: BookmarkFolder[] | undefined;
  var __bookmarks: Bookmark[] | undefined;
}

const questions = globalThis.__questions || [...mockQuestions];
const interviewSessions = globalThis.__interviewSessions || [...mockInterviewSessions];
const bookmarkFolders = globalThis.__bookmarkFolders || [...mockBookmarkFolders];
const bookmarks = globalThis.__bookmarks || [...mockBookmarks];

// 전역 변수에 저장하여 Hot Reload 시에도 데이터 보존
globalThis.__questions = questions;
globalThis.__interviewSessions = interviewSessions;
globalThis.__bookmarkFolders = bookmarkFolders;
globalThis.__bookmarks = bookmarks;

// 질문 관련 함수들
export function getAllQuestions(): Question[] {
  return questions;
}

export function getQuestionById(id: number): Question | undefined {
  return questions.find(q => q.id === id);
}

export function getQuestionsByField(field: string): Question[] {
  return questions.filter(q => q.field === field || q.field === '공통');
}

export function searchQuestions(query: string): Question[] {
  const lowerQuery = query.toLowerCase();
  return questions.filter(q => 
    q.title.toLowerCase().includes(lowerQuery) ||
    q.content.toLowerCase().includes(lowerQuery) ||
    q.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// 면접 세션 관련 함수들
export function createInterviewSession(userId: number, questionIds: number[]): InterviewSession {
  console.log('Creating interview session for user:', userId, 'with question IDs:', questionIds);
  console.log('Available questions count:', questions.length);
  console.log('Available question IDs:', questions.map(q => q.id));
  
  const sessionQuestions = questions.filter(q => questionIds.includes(q.id));
  console.log('Filtered questions count:', sessionQuestions.length);
  
  if (sessionQuestions.length === 0) {
    console.error('No questions found for the provided IDs');
  }
  
  const newSession: InterviewSession = {
    id: interviewSessions.length + 1,
    userId,
    questions: sessionQuestions,
    startedAt: new Date().toISOString(),
    status: 'in_progress',
    answers: []
  };
  interviewSessions.push(newSession);
  // 전역 변수 업데이트
  globalThis.__interviewSessions = interviewSessions;
  console.log('Session created with ID:', newSession.id);
  console.log('Total sessions after creation:', interviewSessions.length);
  return newSession;
}

export function getInterviewSession(sessionId: number): InterviewSession | undefined {
  console.log('getInterviewSession called with ID:', sessionId);
  console.log('Available sessions:', interviewSessions.map(s => ({ id: s.id, userId: s.userId })));
  const session = interviewSessions.find(s => s.id === sessionId);
  console.log('Found session:', session ? `ID ${session.id}` : 'null');
  return session;
}

export function updateInterviewSession(sessionId: number, updates: Partial<InterviewSession>): InterviewSession | null {
  const index = interviewSessions.findIndex(s => s.id === sessionId);
  if (index === -1) return null;
  
  interviewSessions[index] = { ...interviewSessions[index], ...updates };
  // 전역 변수 업데이트
  globalThis.__interviewSessions = interviewSessions;
  return interviewSessions[index];
}

export function getUserInterviewSessions(userId: number): InterviewSession[] {
  return interviewSessions.filter(s => s.userId === userId);
}

// 북마크 관련 함수들
export function getUserBookmarks(userId: number): Bookmark[] {
  return bookmarks.filter(b => b.userId === userId);
}

export function addBookmark(userId: number, questionId: number, folderId?: number): Bookmark {
  const newBookmark: Bookmark = {
    id: bookmarks.length + 1,
    userId,
    questionId,
    folderId,
    createdAt: new Date().toISOString()
  };
  bookmarks.push(newBookmark);
  return newBookmark;
}

export function removeBookmark(bookmarkId: number): boolean;
export function removeBookmark(userId: number, questionId: number): boolean;
export function removeBookmark(arg1: number, arg2?: number): boolean {
  let index: number;
  
  if (arg2 !== undefined) {
    // userId, questionId로 호출된 경우
    index = bookmarks.findIndex(b => b.userId === arg1 && b.questionId === arg2);
  } else {
    // bookmarkId로 호출된 경우
    index = bookmarks.findIndex(b => b.id === arg1);
  }
  
  if (index === -1) return false;
  
  bookmarks.splice(index, 1);
  return true;
}

export function getUserBookmarkFolders(userId: number): BookmarkFolder[] {
  return bookmarkFolders.filter(f => f.userId === userId);
}

export function createBookmarkFolder(userId: number, name: string, description?: string): BookmarkFolder {
  const newFolder: BookmarkFolder = {
    id: bookmarkFolders.length + 1,
    userId,
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  bookmarkFolders.push(newFolder);
  return newFolder;
}
