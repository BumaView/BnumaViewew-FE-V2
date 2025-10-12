import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

// 임시 사용자 데이터베이스 (메모리에 저장)
export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  // 온보딩 정보
  age?: number;
  desiredField?: string;
  desiredCompany?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  onboardingCompleted?: boolean;
}

// 초기 사용자 데이터 (실제 환경에서는 데이터베이스에서 가져옴)
const users: User[] = [
  {
    id: 1,
    username: 'shjshj080722',
    password: bcrypt.hashSync('password', 10),
    name: '조하민',
    role: 'user',
    age: 25,
    desiredField: '프론트엔드 개발',
    desiredCompany: '카카오',
    experience: '2년',
    education: '대학교 졸업',
    skills: ['React', 'TypeScript', 'Next.js'],
    onboardingCompleted: true
  },
  {
    id: 2,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10),
    name: '김선생',
    role: 'admin',
    onboardingCompleted: true
  },
  {
    id: 3,
    username: 'frontend_dev',
    password: bcrypt.hashSync('password123', 10),
    name: '박민수',
    role: 'user',
    age: 28,
    desiredField: '프론트엔드 개발',
    desiredCompany: '네이버',
    experience: '3년',
    education: '대학교 졸업',
    skills: ['Vue.js', 'JavaScript', 'CSS', 'HTML', 'Webpack'],
    onboardingCompleted: true
  },
  {
    id: 4,
    username: 'backend_master',
    password: bcrypt.hashSync('secure123', 10),
    name: '이지영',
    role: 'user',
    age: 30,
    desiredField: '백엔드 개발',
    desiredCompany: '삼성전자',
    experience: '5년',
    education: '대학원 졸업',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Docker'],
    onboardingCompleted: true
  },
  {
    id: 5,
    username: 'fullstack_pro',
    password: bcrypt.hashSync('fullstack456', 10),
    name: '김태현',
    role: 'user',
    age: 26,
    desiredField: '풀스택 개발',
    desiredCompany: '토스',
    experience: '2년',
    education: '대학교 졸업',
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'AWS'],
    onboardingCompleted: true
  },
  {
    id: 6,
    username: 'data_scientist',
    password: bcrypt.hashSync('data789', 10),
    name: '정수진',
    role: 'user',
    age: 29,
    desiredField: '데이터 사이언스',
    desiredCompany: '쿠팡',
    experience: '4년',
    education: '대학원 졸업',
    skills: ['Python', 'R', 'TensorFlow', 'Pandas', 'SQL'],
    onboardingCompleted: true
  },
  {
    id: 7,
    username: 'mobile_dev',
    password: bcrypt.hashSync('mobile321', 10),
    name: '최유진',
    role: 'user',
    age: 24,
    desiredField: '모바일 개발',
    desiredCompany: '라인',
    experience: '1년',
    education: '대학교 재학',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
    onboardingCompleted: true
  },
  {
    id: 8,
    username: 'devops_engineer',
    password: bcrypt.hashSync('devops654', 10),
    name: '한준호',
    role: 'user',
    age: 32,
    desiredField: 'DevOps',
    desiredCompany: '배달의민족',
    experience: '5년 이상',
    education: '대학교 졸업',
    skills: ['Kubernetes', 'Docker', 'Jenkins', 'AWS', 'Terraform'],
    onboardingCompleted: true
  },
  {
    id: 9,
    username: 'ai_researcher',
    password: bcrypt.hashSync('ai987', 10),
    name: '송민아',
    role: 'user',
    age: 27,
    desiredField: 'AI/ML 엔지니어',
    desiredCompany: 'LG AI연구원',
    experience: '3년',
    education: '대학원 재학',
    skills: ['PyTorch', 'TensorFlow', 'Python', 'Computer Vision', 'NLP'],
    onboardingCompleted: true
  },
  {
    id: 10,
    username: 'game_developer',
    password: bcrypt.hashSync('game123', 10),
    name: '윤성호',
    role: 'user',
    age: 26,
    desiredField: '게임 개발',
    desiredCompany: '넥슨',
    experience: '2년',
    education: '대학교 졸업',
    skills: ['Unity', 'C#', 'C++', 'Unreal Engine', 'Blender'],
    onboardingCompleted: true
  },
  {
    id: 11,
    username: 'newbie_coder',
    password: bcrypt.hashSync('newbie456', 10),
    name: '이서연',
    role: 'user',
    age: 23,
    desiredField: '프론트엔드 개발',
    desiredCompany: '스타트업',
    experience: '신입',
    education: '대학교 졸업',
    skills: ['HTML', 'CSS', 'JavaScript'],
    onboardingCompleted: true
  },
  {
    id: 12,
    username: 'senior_dev',
    password: bcrypt.hashSync('senior789', 10),
    name: '강동욱',
    role: 'user',
    age: 35,
    desiredField: '백엔드 개발',
    desiredCompany: '우아한형제들',
    experience: '5년 이상',
    education: '대학원 졸업',
    skills: ['Java', 'Spring', 'Microservices', 'Kafka', 'PostgreSQL'],
    onboardingCompleted: true
  },
  {
    id: 13,
    username: 'ui_designer',
    password: bcrypt.hashSync('design321', 10),
    name: '임하은',
    role: 'user',
    age: 25,
    desiredField: '기타',
    desiredCompany: '당근마켓',
    experience: '2년',
    education: '대학교 졸업',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    onboardingCompleted: true
  },
  {
    id: 14,
    username: 'blockchain_dev',
    password: bcrypt.hashSync('blockchain654', 10),
    name: '오준석',
    role: 'user',
    age: 31,
    desiredField: '백엔드 개발',
    desiredCompany: '두나무',
    experience: '4년',
    education: '대학교 졸업',
    skills: ['Solidity', 'Web3.js', 'Ethereum', 'Node.js', 'React'],
    onboardingCompleted: true
  },
  {
    id: 15,
    username: 'security_expert',
    password: bcrypt.hashSync('security987', 10),
    name: '신보라',
    role: 'user',
    age: 33,
    desiredField: '기타',
    desiredCompany: 'NSHC',
    experience: '5년 이상',
    education: '대학원 졸업',
    skills: ['Penetration Testing', 'Network Security', 'Python', 'Linux', 'CISSP'],
    onboardingCompleted: true
  }
];

// 사용자 찾기
export function findUser(username: string): User | undefined {
  return users.find(user => user.username === username);
}

// 사용자 생성
export function createUser(username: string, password: string, name: string, role: 'user' | 'admin' = 'user'): User {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: users.length + 1,
    username,
    password: hashedPassword,
    name,
    role
  };
  users.push(newUser);
  return newUser;
}

// 비밀번호 확인
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

// Access Token 생성
export function generateAccessToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Refresh Token 생성
export function generateRefreshToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

// Token 검증
export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
}

// 사용자 존재 확인
export function userExists(username: string): boolean {
  return users.some(user => user.username === username);
}

// 사용자 프로필 업데이트
export function updateUserProfile(userId: number, profileData: Partial<User>): User | null {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], ...profileData };
  return users[userIndex];
}

// 사용자 ID로 찾기
export function findUserById(userId: number): User | undefined {
  return users.find(user => user.id === userId);
}
